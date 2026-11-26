# Daily website work report — Wilayah Stone

**Date:** Friday, 30 October 2026  
**Project:** Wilayah Stone  
**Scope:** Country-based currency, flat storefront styling, Supabase backend, role-based administration, customer data controls, security and production planning.

## Outcome

The public storefront has been improved and a production-hardening release prepared for publication. The 100-item checklist now records **80 completed implementation items and 20 outstanding launch requirements**. This is cumulative website progress; it does not mean 80 tasks were newly performed today or that paid ordering is fully operational.

Online payment collection remains disabled. No customer purchase, merchant certification, courier contract, product laboratory result or finished-ring retail price is claimed to have been obtained through this work.

## Work completed today

### Country-based currency and storefront presentation

- Added same-origin country detection that selects the visitor’s display currency without asking for GPS access.
- Preserved manual currency override and its browser preference; automatic mode can be restored.
- Added supported country/currency mappings and decimal handling while retaining PKR as payment currency.
- Removed simulated depth and material effects from page surfaces, cards, banners, panels and ring illustrations. Buttons and form controls retain subtle depth.
- Integrated the animated header search, catalogue suggestions, keyboard navigation, close/Escape handling and focus restoration.
- Removed the public administration link from the footer.
- Retained the approved white/emerald/gold identity, supplied Fraktur-inspired logo artwork, Poppins website typography and exact footer brand statement.

### Supabase and persistent data

- Created the Wilayah Stone Supabase project in the owner’s named organisation, in Singapore. The creation quote was $0 per month on its current free plan; this is not a guarantee of future unlimited usage or costs.
- Provisioned Postgres store records, access indexes, controlled atomic functions and a private design-reference storage bucket.
- Enabled row-level security and denied direct browser-role table access.
- Added an authenticated server-to-server bridge. Its secret is stored in protected runtime configuration rather than source or the browser.
- Migrated the existing product override and audit record. Transient rate records and a truncated exchange-rate cache were excluded; exchange rates are refreshed or reconstructed from the dated fallback.
- Retained protected access to any earlier references in the original file storage.
- Added atomic hourly write limits and a daily maintenance job for expired rate counters, plus a database health endpoint.

### Administration and operating workflow

- Reserved the master role for the verified **wilayahstone@gmail.com** identity. It binds on that account’s first matching sign-in; no shared password was embedded.
- Defined seven roles and their server-enforced permissions: master administrator, administrator, catalogue manager, fulfilment, support, editor and viewer.
- Added Team controls to assign, update, enable or disable non-master staff access. The master role is protected against changes through that screen.
- Built the admin portal for catalogue editing, supplier records, request review, quotes, journal publishing, support/privacy queues, payment readiness, the 100-item checklist and audit history.
- Added record pagination and conflict checks so administrative updates do not silently overwrite newer changes.
- Added quote prerequisites: reviewed specifications, approved price, confirmed supplier allocation, adequate quantity and production lead time, exact address and delivery date, proof reference and expiry.
- Added quote withdrawal and customer-account quote display. Quotes remain proposals and do not collect money.

### Customer protection and technical hardening

- Added idempotent design-request submission to prevent duplicate requests on retry and reject a reused key with different details.
- Enforced account ownership for requests, favourites, uploaded references and quotes; internal staff notes are excluded from customer responses.
- Bounded streamed request bodies and checked supported image signatures, MIME types and file size.
- Kept design files private, supplied safe attachment headers and added cleanup when file metadata cannot be saved.
- Added customer account-record downloads and a correction/deletion/export-assistance request workflow.
- Added same-origin write protection, private-response cache controls, security headers, CSP restrictions and noindex for private routes.
- Corrected the hosting-runtime fetch redirect mode and added pre-stream route checks so missing product/journal pages return a real HTTP 404.
- Added usable loading, error and missing-page screens, accessible labels and a protected editor dialog with focus handling.
- Added truthful product/breadcrumb structured data, published-journal route checks and sitemap inclusion for published articles. No fake price, stock, review or rating markup was added.
- Updated privacy copy to reflect the Supabase backend, data location and account data tools.

### Performance and delivery material

- Optimised the main hero, logo and emblem assets from **4,247,338 bytes to 466,596 bytes**, a reduction of **89.0%** in those asset bytes. This is an asset-size result, not a measured page-speed score.
- Preserved the original artwork files and used smaller display encodings; added a small favicon and high-priority hero loading.
- Replaced the outdated production plan with a current, numbered 100-item checklist.
- Prepared a business-input and costing template and a reviewable Swich compliance/integration request. No request was sent to an external person.

## Verification

- **25 automated checks passed** across search, wishlist, currency/location handling, role boundaries, customer-data isolation, private-upload access, request retries, quote prerequisites, privacy/export controls, body limits and security headers.
- **11 live Supabase bridge checks passed**, including rejected credentials, persistence, duplicate insertion, ownership protection and compare-and-set behaviour.
- **7 live storage/access checks passed**, covering denied browser table access, concurrent rate-limit enforcement, private upload/download, blocked public file access and removal of the disposable test image.
- TypeScript checking passed before packaging. The production build and publication result are reported in the accompanying delivery message.
- The local preview service could not start because its infrastructure reported another server instance. It was not treated as a successful preview test. Production browser checks are required after publication.
- The security advisor returned no notices. The performance advisor reports one informational [unused-index notice](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index) for the newly added maintenance index, which is retained for its scheduled expiry query.
- A real signed-in owner/staff/customer acceptance exercise, backup restoration, load testing and actual payment/refund testing are outstanding. Automated role tests use controlled identity and storage fixtures; they do not prove a real provider sign-in or financial transaction.

## What is still needed

The 20 outstanding checklist items cover legal seller and return/contact details; finished-ring costs and approved prices; measured materials and stone disclosures; actual photographs and approved calligraphy; signed supplier allocation and maker capacity; courier rates, acceptance and insurance; Swich approval, channel IDs and production specifications; the remaining order/payment and refund integration; notification sender/provider and DNS; final consumer terms; review of the actual forward-sale process; operational acceptance tests; and a controlled first paid-order exercise.

Full details and the ready-to-send Swich request are in **BUSINESS-INPUTS.md**. Every task and its acceptance requirement is in **PRODUCTION-PLAN.md**.

**Next priority:** Obtain the verified business/product/payment inputs, complete and test the paid-order lifecycle, then authorise paid trading under the approved terms.
