SHELL := /bin/bash

.PHONY: help up down reset logs psql db-shell procs import-sample

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## start the local MySQL container (Colima must be running)
	docker compose up -d db
	@echo "waiting for MySQL..." && until docker compose exec -T db mysqladmin ping -uroot -prootpass --silent 2>/dev/null; do sleep 2; done
	@echo "MySQL ready on localhost:3306 (db=ecom user=ecom pass=ecompass)"

down: ## stop the container, keep data
	docker compose down

reset: ## wipe the database and re-run schema + seed
	docker compose down -v
	$(MAKE) up

logs: ## tail MySQL logs
	docker compose logs -f db

db-shell: ## open a mysql shell inside the container
	docker compose exec db mysql -uecom -pecompass ecom

procs: ## reload db/procs/*.sql into the running container (no full reset)
	@for f in db/procs/*.sql; do echo "  applying $$f"; docker compose exec -T db mysql -uroot -prootpass ecom < "$$f"; done
	@echo "procedures reloaded"

import-sample: ## import the sample catalog via the API (requires: dotnet run in backend/src/Ecom.Api)
	curl -sf -X POST http://localhost:5056/api/admin/products/import \
	  -F "csv=@db/csv-import/products_template.csv" | jq .
