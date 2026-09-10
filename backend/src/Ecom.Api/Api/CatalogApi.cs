using Dapper;
using Ecom.Api.Data;

namespace Ecom.Api.Api;

public static class CatalogApi
{
    public static RouteGroupBuilder MapCatalog(this RouteGroupBuilder api)
    {
        api.MapGet("/categories", async (Database db, CancellationToken ct) =>
        {
            using var conn = await db.OpenAsync(ct);
            var rows = await conn.QueryAsync<CategoryDto>(
                """
                SELECT id, name, slug, product_type AS ProductType,
                       parent_id AS ParentId, sort_order AS SortOrder
                FROM categories
                ORDER BY product_type, sort_order, name
                """);
            return Results.Ok(rows);
        });

        // GET /api/products?category=western&subcategory=&gender=women&q=tee&status=active&page=1&pageSize=24
        api.MapGet("/products", async (
            Database db,
            string? category,
            string? subcategory,
            string? gender,
            string? q,
            string? status,
            int? page,
            int? pageSize,
            CancellationToken ct) =>
        {
            var pageNum = page is null or < 1 ? 1 : page.Value;
            var size = pageSize is null or < 1 or > 100 ? 24 : pageSize.Value;

            // Storefront default: only live products. Pass status=all for admin/dev.
            string? statusFilter = status switch
            {
                null or "" => "active",
                "all" => null,
                _ => status
            };

            var p = new DynamicParameters();
            p.Add("categorySlug", string.IsNullOrWhiteSpace(category) ? null : category);
            p.Add("subcategorySlug", string.IsNullOrWhiteSpace(subcategory) ? null : subcategory);
            p.Add("gender", string.IsNullOrWhiteSpace(gender) ? null : gender);
            p.Add("q", string.IsNullOrWhiteSpace(q) ? null : q);
            p.Add("status", statusFilter);
            p.Add("limit", size);
            p.Add("offset", (pageNum - 1) * size);

            const string where =
                """
                FROM products p
                LEFT JOIN brands b     ON b.id = p.brand_id
                JOIN categories c      ON c.id = p.category_id
                LEFT JOIN categories s ON s.id = p.subcategory_id
                WHERE (@status IS NULL OR p.status = @status)
                  AND (@gender IS NULL OR p.gender = @gender)
                  AND (@categorySlug IS NULL OR c.slug = @categorySlug OR s.slug = @categorySlug)
                  AND (@subcategorySlug IS NULL OR s.slug = @subcategorySlug)
                  AND (@q IS NULL OR p.name LIKE CONCAT('%', @q, '%'))
                """;

            using var conn = await db.OpenAsync(ct);

            var total = await conn.ExecuteScalarAsync<long>($"SELECT COUNT(*) {where}", p);

            var items = (await conn.QueryAsync<ProductListItemDto>(
                $"""
                 SELECT p.id, p.sku, p.name, p.price, p.currency, p.gender, p.status,
                        b.name AS BrandName,
                        c.name AS CategoryName,
                        s.name AS SubcategoryName,
                        (SELECT pi.url FROM product_images pi
                         WHERE pi.product_id = p.id
                         ORDER BY pi.is_primary DESC, pi.sort_order
                         LIMIT 1) AS PrimaryImageUrl
                 {where}
                 ORDER BY p.created_at DESC, p.id DESC
                 LIMIT @limit OFFSET @offset
                 """, p)).ToList();

            return Results.Ok(new Paged<ProductListItemDto>(items, pageNum, size, total));
        });

        api.MapGet("/products/{id:int}", async (int id, Database db, CancellationToken ct) =>
        {
            using var conn = await db.OpenAsync(ct);

            var product = await conn.QuerySingleOrDefaultAsync<ProductHead>(
                """
                SELECT p.id, p.sku, p.name, p.price, p.currency, p.description,
                       p.gender, p.status,
                       b.name AS BrandName,
                       c.name AS CategoryName,
                       s.name AS SubcategoryName
                FROM products p
                LEFT JOIN brands b     ON b.id = p.brand_id
                JOIN categories c      ON c.id = p.category_id
                LEFT JOIN categories s ON s.id = p.subcategory_id
                WHERE p.id = @id
                """, new { id });

            if (product is null)
                return Results.NotFound();

            var images = (await conn.QueryAsync<ProductImageDto>(
                """
                SELECT url, alt_text AS AltText, is_primary AS IsPrimary, sort_order AS SortOrder
                FROM product_images WHERE product_id = @id
                ORDER BY is_primary DESC, sort_order
                """, new { id })).ToList();

            var sizes = (await conn.QueryAsync<ProductSizeDto>(
                """
                SELECT s.label AS Label, s.size_group AS SizeGroup, ps.stock_qty AS StockQty
                FROM product_sizes ps
                JOIN sizes s ON s.id = ps.size_id
                WHERE ps.product_id = @id
                ORDER BY s.sort_order, s.label
                """, new { id })).ToList();

            var materials = (await conn.QueryAsync<string>(
                """
                SELECT m.name FROM product_materials pm
                JOIN materials m ON m.id = pm.material_id
                WHERE pm.product_id = @id
                ORDER BY m.name
                """, new { id })).ToList();

            return Results.Ok(new ProductDetailDto(
                product.Id, product.Sku, product.Name, product.Price, product.Currency,
                product.Description, product.Gender, product.Status,
                product.BrandName, product.CategoryName, product.SubcategoryName,
                images, sizes, materials));
        });

        return api;
    }

    private sealed class ProductHead
    {
        public int Id { get; set; }
        public string Sku { get; set; } = "";
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public string Currency { get; set; } = "INR";
        public string? Description { get; set; }
        public string Gender { get; set; } = "unisex";
        public string Status { get; set; } = "draft";
        public string? BrandName { get; set; }
        public string CategoryName { get; set; } = "";
        public string? SubcategoryName { get; set; }
    }
}
