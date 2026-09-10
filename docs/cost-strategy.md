# Cost strategy: $0 until launch

The whole app is built and tested locally. No billable AWS resource is created
until the store is genuinely ready to go live.

| Concern | During dev (now) | At launch |
|---|---|---|
| Database | MySQL 8.4 in Colima (`docker compose up db`) | RDS MySQL `db.t4g.micro` (free tier 12 mo) |
| API | `.NET` Lambda run locally via `sam local start-api` | Lambda + API Gateway (1M req/mo free) |
| Frontend | `npm run dev` (Vite) | S3 + CloudFront (1 TB/mo free) |
| Auth | stubbed / local JWT | Cognito (10k MAU free, indefinitely) |
| AI stylist | Anthropic API from local API, pay-per-token cents | Lambda -> Bedrock/Anthropic, **flag off** |
| DNS / domain | none yet | Route 53 hosted zone ~$0.50/mo + domain ~$12/yr |

**Expected bill:** ~$0 through dev; ~$1-3/month year 1 after launch (just Route 53
+ domain, everything else inside free tier); ~$15-18/month once the RDS free tier
ends, dominated by the always-on database.

**Rules while in dev:**

1. Do not run `cdk deploy`. The CDK stack is written and synth-tested
   (`cdk synth`) but never deployed.
2. Do not register a domain or create a Route 53 hosted zone until launch is
   scheduled. (Only exception: register the domain early if the exact name
   matters and you're worried about losing it - ~$12/yr, no hosting cost.)
3. `ai_stylist_enabled` stays `0` in `store_config`. The stylist Lambda and UI
   ship in the codebase but are never wired into a live path.
4. Keep the local MySQL version (`8.4`) matching the planned RDS engine version
   so there are no surprises at launch.
