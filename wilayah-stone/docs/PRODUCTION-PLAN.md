# Wilayah Stone — current production checklist

Updated 12 November 2026 for WhatsApp contact, email-code administration and shared store roles. Completed implementation and outstanding external setup are distinguished.

1. **[Complete] Correct spaced brand name** — Wilayah Stone is used consistently in page titles and customer content.
2. **[Complete] Approved logo artwork** — Header and footer retain the supplied gold and emerald landscape artwork.
3. **[Complete] Consistent tagline** — Love and wilayah in every hand. is used as the established tagline.
4. **[Complete] White emerald and gold palette** — Shared design tokens preserve the approved colour system.
5. **[Complete] Flat page surfaces** — Cards, panels, banners, illustrations, header and footer have no simulated material depth.
6. **[Complete] Tactile buttons and forms** — Depth is limited to action controls and form fields.
7. **[Complete] Poppins website typography** — Poppins styles website copy; the supplied Fraktur-inspired wordmark remains artwork.
8. **[Complete] Footer brand statement** — The owner’s supplied premium-silver and honest-craftsmanship statement is present.
9. **[Complete] Product-only presentation** — Site assets contain no people, hands, faces, couples or audio elements.
10. **[Complete] Honest concept-image labels** — Illustrations and the generated hero are labelled accurately.
11. **[Complete] 52 design combinations** — Four engraved families have twelve names each; four other stones have plain designs.
12. **[Complete] Stable product identifiers** — Every design has a unique SKU retained across search, wishlist and requests.
13. **[Complete] Eight gemstone families** — Aqeeq, Firoza, Dur-e-Najaf, Hadeed-e-Chini, Yaqoot, Peridot, Emerald and Marjaan are included.
14. **[Complete] Per-stone descriptions** — Catalogue descriptions explain the selected design without invented origin or benefits.
15. **[Complete] Permanent product pages** — Each SKU has a direct product URL and descriptive metadata.
16. **[Complete] Jewellery specification sections** — Product pages show material, weight, dimensions, origin, treatment and engraving fields.
17. **[Complete] Stone-specific care** — Each gemstone family has an appropriate care and disclosure section.
18. **[Complete] Related product discovery** — Related designs are selected from the same stone or engraving family.
19. **[Complete] Truthful product structured data** — Product and breadcrumb JSON-LD omit invented offers, reviews and availability.
20. **[Complete] Internal supplier data separation** — Supplier allocation and capacity are excluded from public product responses.
21. **[Complete] Animated header search** — The search icon transitions into the header input.
22. **[Complete] Live catalogue suggestions** — Typing returns matching catalogue designs and a view-all route.
23. **[Complete] Keyboard search and focus restoration** — Arrow keys, Enter, Escape and the close control support the header search.
24. **[Complete] Alternative spelling search** — Gemstone aliases, Imam-name variants, Urdu terms and SKU queries are recognised.
25. **[Complete] Combined catalogue filters** — Gemstone, metal, price and availability filters work together.
26. **[Complete] Sorting and empty results** — Name and price sorting and clear-filter empty states are available.
27. **[Complete] Persistent guest wishlist** — Saved designs survive reload and reject malformed or unknown entries.
28. **[Complete] Account wishlist and import** — Signed-in favourites are owner-scoped; guest import is idempotent and validated.
29. **[Complete] Selection bag and personalisation** — Customers select ring size and engraving before submitting an enquiry.
30. **[Complete] Customer design upload** — PNG, JPEG and WebP reference uploads are supported within size limits.
31. **[Complete] Country-level currency detection** — A same-origin edge-country lookup chooses the default currency.
32. **[Complete] Country-to-currency mapping** — Current CLDR mappings select supported local currencies for priority markets and other territories.
33. **[Complete] Manual currency override** — A shopper can select a currency explicitly.
34. **[Complete] Remembered currency preference** — Manual choices persist across reloads; automatic mode clears the manual choice.
35. **[Complete] Safe automatic fallback** — Unknown country or failed detection defaults to PKR.
36. **[Complete] Server-side exchange-rate cache** — Rates are fetched and cached by the server rather than exposing a raw rate feed.
37. **[Complete] Agreed payment currency disclosure** — Catalogue conversions are estimates; the final quote records the exact charge amount and currency.
38. **[Complete] Correct decimal handling** — Zero-decimal, three-decimal and PKR paisa rounding are handled separately.
39. **[Complete] Rate freshness and expiry** — Dated fallback rates expire and unavailable estimates fall back to authoritative PKR display.
40. **[Complete] Country lookup privacy** — No GPS request, precise coordinates or IP address is returned to the browser.
41. **[Complete] Customer account sign-in** — Customer account authentication remains separate from the email-based staff portal.
42. **[Complete] Owner-scoped customer records** — Customers can access only their own requests, uploads, favourites and quotes.
43. **[Complete] Idempotent design requests** — A stable request key prevents duplicate creation when the same submission is retried.
44. **[Complete] Request review timeline** — Customer-visible stages are recorded without exposing internal staff notes.
45. **[Complete] Detailed account quotes** — Accounts display exact proposed specifications, total, address, delivery date and expiry.
46. **[Complete] Account data export** — A private JSON record export is available; large exports disclose the assistance requirement.
47. **[Complete] Privacy request workflow** — Customers can request correction, deletion or export assistance through their account.
48. **[Complete] Browser data controls** — Guest selections can be cleared separately from account records.
49. **[Complete] Bounded request parsing** — JSON and upload bodies are bounded even without a Content-Length header.
50. **[Complete] Upload content validation** — Supported image signatures are checked and downloads use safe attachment headers.
51. **[Complete] Supabase project provisioned** — A healthy Wilayah Stone project exists in the owner’s named organisation.
52. **[Complete] Persistent Postgres schema** — Store records, private server credentials and controlled RPC functions are provisioned.
53. **[Complete] Record access indexes** — Indexes cover kind, owner, creation time and record ID ordering.
54. **[Complete] Anonymous database access denied** — RLS is enabled and browser roles have no direct table or RPC access.
55. **[Complete] Private reference bucket** — The design-reference bucket is private and enforces MIME and size restrictions.
56. **[Complete] Authenticated server bridge** — The store backend requires a server-only credential; no service secret is embedded in source.
57. **[Complete] Existing records preserved** — The existing product override and audit record were migrated; transient rate/cache rows were excluded.
58. **[Complete] Atomic record operations** — Insert-once and compare-and-set operations protect duplicates and concurrent updates.
59. **[Complete] Atomic hourly rate limits** — Database-level counters limit authenticated writes and uploads.
60. **[Complete] Database health endpoint** — A bounded health route reports availability without exposing configuration or records.
61. **[Complete] Email-based company administrator signup** — The authorised company email account receives Store administrator access and completes first-visit role selection.
62. **[Complete] Six staff roles** — Store administrator, catalogue manager, fulfilment, support, editor and viewer permissions are enforced by the server.
63. **[Complete] Shared team access controls** — Store administrators can approve role requests and manage each other’s access; the last claimed active administrator is protected.
64. **[Complete] Server-enforced permissions** — Every protected read and mutation checks its corresponding permission.
65. **[Complete] Validated catalogue editor** — Staff can manage prices, specifications, supplier allocation and review state with server validation.
66. **[Complete] Supplier creation and editing** — Capacity, lead days, evidence and reservation notes are stored in supplier records.
67. **[Complete] Request review management** — Staff update review stages and private notes with concurrent-update protection.
68. **[Complete] Journal publishing and editing** — Editors create, update, publish or unpublish plain-text articles.
69. **[Complete] Support and privacy queues** — Authorised support staff manage incoming enquiries and privacy-request status.
70. **[Complete] Administrative audit trail** — Administrative changes record action, role, record reference and timestamp.
71. **[Complete] Versioned customer policies** — Help, FAQ, payment, shipping, refunds, care, privacy and terms pages are present.
72. **[Complete] Quote prerequisites and expiry** — Quotes require reviewed products, pricing, sourcing, exact delivery terms and a future expiry.
73. **[Complete] Bounded admin pagination** — Operational record lists load in pages rather than returning unlimited customer data.
74. **[Complete] HTTP security controls** — Same-origin writes, no-store private responses, CSP, nosniff, referrer and permission policies are applied.
75. **[Complete] SEO routing and crawl controls** — Canonical metadata, sitemap entries, published journal URLs and private-route noindex are maintained.
76. **[Complete] Loading error and missing-page states** — Customers receive usable retry, loading and 404 screens.
77. **[Complete] Responsive and reduced-motion styles** — Narrow-screen admin layouts, focus states and reduced-motion rules are provided.
78. **[Complete] Automated checks and release build** — Core behaviour, authorization boundaries and the production build are checked before publication.
79. **[Complete] Online gateway removal** — Online gateway adapters, checkout controls and stored provider credentials are removed.
80. **[Complete] Business inputs and workbook review** — All 22 workbook sheets have been structurally reviewed and mapped to the portal; unknown commercial facts remain blank.
81. **[Outstanding] Legal seller identity** — Supply the legal business name, registration or sole-trader details, full address and customer contact.
82. **[Outstanding] Final retail prices and cost approvals** — Approve stone, silver, labour, engraving, packaging, shipping, fee and margin calculations for each SKU.
83. **[Outstanding] Measured product specifications** — Provide verified silver weight, tolerances, stone dimensions and maker-approved ring sizes.
84. **[Outstanding] Stone identity origin and treatment evidence** — Supply accurate sourcing, natural/synthetic status, treatments and any supporting laboratory evidence.
85. **[Outstanding] Actual product photography** — Supply compliant photographs of the actual items; concept images cannot establish product appearance.
86. **[Outstanding] Sacred-name artwork approval** — Approve exact spelling and production proofs for all forty-eight engraved variants.
87. **[Outstanding] Supplier reservation agreement** — Record allocation, reservation expiry, quality, pricing, exclusivity scope and remedies in agreed terms.
88. **[Outstanding] Maker capacity and production commitment** — Agree achievable production capacity and fixed lead times before promising delivery.
89. **[Outstanding] Courier rates service areas and insurance** — Confirm carrier jewellery acceptance, coverage for each offered destination, loss cover, rates and handling process.
90. **[Complete] Primary WhatsApp contact active** — Orders, enquiries and customer support use +92 370 5198895. The number is saved in the backend and the public email is removed.
91. **[Outstanding] Manual receiving account instructions** — Management supplies the receiving account and supported manual methods directly to each customer after agreement.
92. **[Complete] Manual receipt ledger** — The server validates the agreed currency, receipt reference, receiving-account check, balance and duplicate receipt attempts.
93. **[Complete] Manual order and fulfilment lifecycle** — An agreed order snapshot, atomic receipt ledger, supplier allocation, production, quality review, Karachi receiving and customer dispatch are connected.
94. **[Complete] Manual refund approval and repayment** — A named manager approves refunds; actual repayments are recorded against the original order and excess or duplicate refunds are rejected.
95. **[Complete] Customer communication workflow** — WhatsApp conversations and staff updates are handled manually. Account quote/order states and support responses are available; no automatic WhatsApp or email sending is claimed.
96. **[Outstanding] Custom domain and sender DNS** — Provide the store domain and approved DNS access or records for domain and email verification.
97. **[Outstanding] Final consumer-policy approval** — Approve seller details, cancellation/refund handling, retention periods, service contacts and applicable legal requirements.
98. **[Outstanding] Review actual forward-sale contract** — Review the implemented offer, acceptance, receipt of full payment and non-delivery remedies with a qualified adviser.
99. **[Outstanding] Email delivery and operational acceptance** — Configure company email delivery, complete a real email-code sign-in, and finish owner/staff/customer, device, restore and load acceptance checks.
100. **[Outstanding] Controlled first paid-order acceptance** — After all prerequisites, complete an authorised end-to-end payment, fulfilment and refund acceptance exercise.
