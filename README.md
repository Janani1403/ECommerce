# E-commerce template

A reusable, loosely-coupled storefront: React frontend, C#/.NET serverless API,
MySQL (relational), deployable to AWS. Built to be spun up per client - swap the
catalog (CSV import), pick a theme, flip feature flags.

Until launch, **everything runs locally at $0** - no billable AWS resources are
created. See `docs/cost-strategy.md`.

## Stack

| Layer | Local dev | Production (AWS) |
|---|---|---|
| Frontend | Vite dev server | S3 + CloudFront |
| API | .NET Lambda via `sam local` | Lambda + API Gateway |
| Database | MySQL 8.4 in Docker | RDS MySQL `db.t4g.micro` |
| Auth | (stubbed) | Cognito - one admin role + customers |
| AI stylist | Anthropic API, called from local API | Lambda -> Bedrock/Anthropic (flag-gated, off) |
| Infra | - | AWS CDK (`infrastructure/`) |

## Layout

```
frontend/        React + Vite
backend/         .NET Lambda functions + shared data layer
infrastructure/  AWS CDK stack (S3, CloudFront, Lambda, RDS, Cognito)
db/
  schema/        DDL - source of truth for the database
  seed/          example lookup + config data for local dev
  csv-import/    canonical product CSV template + import script
docs/            architecture decisions
```

## Prerequisites

Installed via Homebrew: `node`, `dotnet`, `awscli`, `aws-sam-cli`, `aws-cdk` (npm),
`colima` + `docker` + `docker-compose`, `dbeaver-community`. Verify:

```bash
node --version && dotnet --version && aws --version && sam --version && cdk --version && docker --version
```

## Getting started

```bash
cp .env.example .env
docker compose up -d db          # starts MySQL, runs db/schema + db/seed on first boot
docker compose logs -f db        # wait for "ready for connections"
```

Connect with DBeaver: `localhost:3306`, database `ecom`, user `ecom` / `ecompass`.

Load the sample catalog through the CSV importer:

```bash
make import-sample
```

Common tasks are in the `Makefile` (`make help`). To rebuild the database from
scratch after a schema change:

```bash
make reset          # docker compose down -v && up -d db
```

### Run the app (three terminals)

```bash
make up                                        # 1. MySQL
cd backend/src/Ecom.Api && dotnet run          # 2. API  -> http://localhost:5056
cd frontend && npm install && npm run dev      # 3. storefront -> http://localhost:5173
```

The Vite dev server proxies `/api/*` to the API, so no CORS setup is needed
locally. The API reads its connection string from `appsettings.Development.json`;
production reads `CONNECTION_STRING` from the environment.

## Themes & layouts

The storefront ships **5 themes x 5 product-list layouts**, chosen independently
and stored in the database (`store_config.active_theme_id`, `active_layout`).
This is what makes one codebase serve many stores - and seeds the template
picker for the site-builder use case.

- **Themes** (`frontend/src/theme/themes/*.css`): `lavender-mist`, `peach-sorbet`,
  `sage-mint`, `ombre-dusk`, `porcelain-noir`. Each redefines the same token
  contract (`theme/tokens.css`) under `[data-theme="<key>"]`. Add one: drop a CSS
  file, register it in `theme/registry.ts`, add a `ui_themes` row.
- **Layouts** (`frontend/src/layouts/*`): `grid`, `masonry`, `editorial`,
  `compact`, `spotlight`. Each is a component taking `{ products }`. Add one:
  build the component, register it in `layouts/registry.ts`.
- **Preview**: the floating **Studio** panel (dev only, or `VITE_ENABLE_STUDIO=true`)
  swaps any theme/layout combo live without touching the database.
- Per-store colour tweaks go in `ui_themes.css_variables` (JSON), merged on top
  of the CSS file at runtime.

### Docker engine (Colima)

This project uses [Colima](https://github.com/abiosoft/colima) as the Docker
engine (no Docker Desktop, no license question, no sudo). Start it once per
session - or enable it at login:

```bash
colima start            # or: brew services start colima
colima status
```

## Database design notes

- **Categories are flat.** `products.category_id` + nullable `products.subcategory_id`
  are direct indexed FKs into `categories` - no recursive tree, no recursive CTEs.
  A deeper level later = one more nullable column.
- **PII is isolated** in `customer_profiles` and `addresses`. Everything else
  (orders, carts, reviews, style profiles) references the internal `customers.id`.
  A deletion request touches only those two tables plus a cascade.
- **Every admin write** goes through one helper that records to `audit_log`
  before commit.
- **`store_config`** is a single row (`id = 1`) - theme, layout, and feature flags.
