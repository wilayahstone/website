# Wilayah Stone

Men’s made-to-order 925 silver ring catalogue and private business operations portal. React/TypeScript with Vinext on Sites; Supabase provides the production database and private artwork storage. No Shopify or online payment gateway.

## Ordering

1. Customers browse 52 design combinations across eight stone families, use search and filters, save favourites, and collect designs in their selection bag.
2. The WhatsApp button opens a prepared message containing selected product codes, sizes and engraving references. The customer reviews and sends the message. No automatic message or payment occurs.
3. Staff agree the exact material and measurements, approved engraving proof, quantity, total price and currency, delivery address and delivery-by date.
4. An administrator records the written agreement in Orders. The seller identity and supplier allocation are required. Agreed amounts and specifications are preserved in the order snapshot.
5. A manager records manual receipts only after checking the actual receiving account. Receipts are immutable, idempotent and protected by atomic compare-and-set. Currency and balance checks run on the server.
6. Production requires full receipt and confirmed supplier allocation. Quality approval and Karachi receiving precede customer dispatch. Staff record courier handover, tracking and actual delivery.
7. Refunds require a named manager’s approval and an actual repayment reference. The portal records money movements; it never transfers funds.

## Store administrator setup

Open `/admin` with the company’s existing shared store access code. Administrator sessions are separate from customer accounts and support multiple staff browsers. Customers create an account with email and password and sign in immediately, without Google or email codes. Do not put access codes or runtime keys in this repository. See docs/VERCEL-HANDOVER.md for the company-hosted migration.

The primary WhatsApp number +92 370 5198895 is enabled for orders and support. Public email links have been removed. Save the actual legal seller name and business address in Settings before accepting orders. The workbook did not supply these commercial details.

Add real suppliers and confirmed allocations, measured product specifications, actual prices and delivery lead times. No template row is treated as real stock, an order, a supplier, or a customer.

Gateway adapters and runtime credentials have been removed. Old `/api/stripe/checkout` and `/api/stripe/webhook` endpoints return HTTP 410 and make no provider calls.

## Administration

Core tabs: Overview, Catalogue, Requests, Quotes, Suppliers, Journal, Enquiries, Orders, Team, Governance, Operations, Reports, Settings, Manage records, Recycle bin, Readiness and Audit log. Tabs and individual server operations follow server-side permissions. The current company access mode uses shared administrator sessions.

Operations provides customers, physical gemstone lots, costing, manufacturing, manual receipt ledger, two-stage shipping, marketing, listings, after-sales tickets, complaints/refunds, expenses and design/content approvals. It supports record creation, validated edits, optimistic concurrency, loaded-record searches, pagination and CSV exports with formula-injection protection. Receipts and repaid refunds are locked.

Reports separate currencies and show missing reporting exchange rates and missing order costs. Product Cost expenses are not subtracted a second time from recorded order costs. Reports explicitly identify their cash basis and bounded scan limit. Settings’ manual reporting rates are used for private business reporting. Public currency selection is not used.

Recoverable deletion hides active records while preserving agreements, receipts and audit history. Store administrators can restore records from Recycle bin.

Private operational records use the existing Supabase `ws_records` table with `kind=setting` and a module-specific owner. The server whitelist and RBAC are authoritative; these records are never included in the public catalogue response. No additional public table permissions or schema changes are required.

## Workbook review

See [docs/WORKBOOK_REVIEW.md](docs/WORKBOOK_REVIEW.md) for the source review, limitations and mapping of all 22 sheets to the application.

## Checks

```bash
node node_modules/typescript/bin/tsc --noEmit
node --test tests/production.test.mjs tests/store.test.mjs
```

The production tests cover account isolation, staff identity binding, role enforcement, private uploads, request idempotency, manual receipts/refunds, capacity reservation, fulfilment gates, currency reporting, and retired gateway endpoints. Test records are in-memory fixtures; tests never create customer orders or move money in production.

Use the Sites managed preview/build/source publication helpers from the installed Sites plugin. Keep runtime secrets in Sites hosting settings. `.openai/hosting.json` binds this checkout to the existing company project; do not create a replacement Site.

## Product features and deployment

Product attributes, variation options with independent SKUs/prices, drafts, scheduled publication and editable quantity discounts are maintained in the catalogue editor. See docs/product-variations.md and docs/VERCEL-HANDOVER.md. GitHub upload and Vercel deployment are planned for tomorrow; creating this archive does not perform those external steps.
