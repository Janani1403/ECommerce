#!/usr/bin/env python3
"""
Canonical product CSV -> MySQL importer.

This is the one piece of logic every client's catalog runs through. Build it
once, reuse per store. It is idempotent on `sku`: re-running updates the product
and replaces its materials / sizes / images.

CSV columns (see products_template.csv):
    sku, name, product_type, category, subcategory, brand, price, currency,
    gender, status, description, materials, sizes, image_urls

  * product_type : clothes | accessories | footwear
  * category / subcategory : names; created in `categories` if missing
  * materials   : pipe-separated names           e.g.  Cotton|Linen
  * sizes       : pipe-separated label:stock      e.g.  S:5|M:10|L:3
  * image_urls  : pipe-separated URLs; first one becomes is_primary

Usage:
    pip install "mysql-connector-python>=9"
    python import_products.py products_template.csv \
        --host 127.0.0.1 --port 3306 --db ecom --user ecom --password ecompass
"""
import argparse
import csv
import sys

import mysql.connector


def slugify(text: str) -> str:
    return "-".join("".join(c.lower() if c.isalnum() else " " for c in text).split())


def upsert_brand(cur, name):
    if not name:
        return None
    cur.execute(
        "INSERT INTO brands (name, slug) VALUES (%s, %s) "
        "ON DUPLICATE KEY UPDATE name = VALUES(name), id = LAST_INSERT_ID(id)",
        (name, slugify(name)),
    )
    return cur.lastrowid


def upsert_category(cur, name, product_type, parent_id=None):
    if not name:
        return None
    cur.execute(
        "INSERT INTO categories (name, slug, product_type, parent_id) VALUES (%s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE name = VALUES(name), id = LAST_INSERT_ID(id)",
        (name, slugify(name), product_type, parent_id),
    )
    return cur.lastrowid


def upsert_material(cur, name):
    cur.execute(
        "INSERT INTO materials (name) VALUES (%s) "
        "ON DUPLICATE KEY UPDATE name = VALUES(name), id = LAST_INSERT_ID(id)",
        (name,),
    )
    return cur.lastrowid


def get_size_id(cur, label):
    cur.execute("SELECT id FROM sizes WHERE label = %s ORDER BY id LIMIT 1", (label,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO sizes (label, size_group, sort_order) VALUES (%s, 'imported', 99)",
        (label,),
    )
    return cur.lastrowid


def import_row(cur, row):
    brand_id = upsert_brand(cur, row.get("brand", "").strip())
    category_id = upsert_category(
        cur, row["category"].strip(), row["product_type"].strip()
    )
    subcategory_id = upsert_category(
        cur, row.get("subcategory", "").strip(), row["product_type"].strip(), category_id
    )

    cur.execute(
        """
        INSERT INTO products
            (sku, name, brand_id, category_id, subcategory_id, price, currency,
             description, gender, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name), brand_id = VALUES(brand_id),
            category_id = VALUES(category_id), subcategory_id = VALUES(subcategory_id),
            price = VALUES(price), currency = VALUES(currency),
            description = VALUES(description), gender = VALUES(gender),
            status = VALUES(status), id = LAST_INSERT_ID(id)
        """,
        (
            row["sku"].strip(),
            row["name"].strip(),
            brand_id,
            category_id,
            subcategory_id,
            row["price"].strip(),
            (row.get("currency") or "INR").strip(),
            (row.get("description") or "").strip() or None,
            (row.get("gender") or "unisex").strip(),
            (row.get("status") or "draft").strip(),
        ),
    )
    product_id = cur.lastrowid

    # Replace child rows so re-import is a clean sync.
    cur.execute("DELETE FROM product_materials WHERE product_id = %s", (product_id,))
    for mat in filter(None, (m.strip() for m in row.get("materials", "").split("|"))):
        cur.execute(
            "INSERT IGNORE INTO product_materials (product_id, material_id) VALUES (%s, %s)",
            (product_id, upsert_material(cur, mat)),
        )

    cur.execute("DELETE FROM product_sizes WHERE product_id = %s", (product_id,))
    for token in filter(None, (s.strip() for s in row.get("sizes", "").split("|"))):
        label, _, qty = token.partition(":")
        cur.execute(
            "INSERT INTO product_sizes (product_id, size_id, stock_qty) VALUES (%s, %s, %s)",
            (product_id, get_size_id(cur, label.strip()), int(qty or 0)),
        )

    cur.execute("DELETE FROM product_images WHERE product_id = %s", (product_id,))
    urls = [u.strip() for u in row.get("image_urls", "").split("|") if u.strip()]
    for i, url in enumerate(urls):
        cur.execute(
            "INSERT INTO product_images (product_id, url, is_primary, sort_order) "
            "VALUES (%s, %s, %s, %s)",
            (product_id, url, 1 if i == 0 else 0, i),
        )

    return product_id


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv_file")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=3306)
    ap.add_argument("--db", default="ecom")
    ap.add_argument("--user", default="ecom")
    ap.add_argument("--password", default="ecompass")
    args = ap.parse_args()

    conn = mysql.connector.connect(
        host=args.host, port=args.port, database=args.db,
        user=args.user, password=args.password,
    )
    conn.autocommit = False
    cur = conn.cursor()

    ok = 0
    try:
        with open(args.csv_file, newline="", encoding="utf-8") as fh:
            for n, row in enumerate(csv.DictReader(fh), start=1):
                try:
                    import_row(cur, row)
                    ok += 1
                except Exception as exc:  # noqa: BLE001
                    conn.rollback()
                    print(f"row {n} ({row.get('sku')}): {exc}", file=sys.stderr)
                    sys.exit(1)
        conn.commit()
    finally:
        cur.close()
        conn.close()

    print(f"imported/updated {ok} product(s)")


if __name__ == "__main__":
    main()
