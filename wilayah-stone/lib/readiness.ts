export type ReadinessTask={id:number;group:string;title:string;status:"Complete"|"Outstanding";acceptance:string;owner:string;dependency:string};
export const readiness:ReadinessTask[]=[
  {
    "id": 1,
    "group": "Brand",
    "title": "Correct spaced brand name",
    "status": "Complete",
    "acceptance": "Wilayah Stone is used consistently in page titles and customer content.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 2,
    "group": "Brand",
    "title": "Approved logo artwork",
    "status": "Complete",
    "acceptance": "Header and footer retain the supplied gold and emerald landscape artwork.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 3,
    "group": "Brand",
    "title": "Consistent tagline",
    "status": "Complete",
    "acceptance": "Love and wilayah in every hand. is used as the established tagline.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 4,
    "group": "Brand",
    "title": "White emerald and gold palette",
    "status": "Complete",
    "acceptance": "Shared design tokens preserve the approved colour system.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 5,
    "group": "Brand",
    "title": "Flat page surfaces",
    "status": "Complete",
    "acceptance": "Cards, panels, banners, illustrations, header and footer have no simulated material depth.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 6,
    "group": "Brand",
    "title": "Tactile buttons and forms",
    "status": "Complete",
    "acceptance": "Depth is limited to action controls and form fields.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 7,
    "group": "Brand",
    "title": "Poppins website typography",
    "status": "Complete",
    "acceptance": "Poppins styles website copy; the supplied Fraktur-inspired wordmark remains artwork.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 8,
    "group": "Brand",
    "title": "Footer brand statement",
    "status": "Complete",
    "acceptance": "The owner’s supplied premium-silver and honest-craftsmanship statement is present.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 9,
    "group": "Brand",
    "title": "Product-only presentation",
    "status": "Complete",
    "acceptance": "Site assets contain no people, hands, faces, couples or audio elements.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 10,
    "group": "Brand",
    "title": "Honest concept-image labels",
    "status": "Complete",
    "acceptance": "Hero and product renders are described accurately, without claims of photographed finished stock.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 11,
    "group": "Catalogue",
    "title": "52 design combinations",
    "status": "Complete",
    "acceptance": "Four engraved families have twelve names each; four other stones have plain designs.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 12,
    "group": "Catalogue",
    "title": "Stable product identifiers",
    "status": "Complete",
    "acceptance": "Every design has a unique SKU retained across search, wishlist and requests.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 13,
    "group": "Catalogue",
    "title": "Eight gemstone families",
    "status": "Complete",
    "acceptance": "Aqeeq, Firoza, Dur-e-Najaf, Hadeed-e-Chini, Yaqoot, Peridot, Emerald and Marjaan are included.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 14,
    "group": "Catalogue",
    "title": "Per-stone descriptions",
    "status": "Complete",
    "acceptance": "Catalogue descriptions explain the selected design without invented origin or benefits.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 15,
    "group": "Catalogue",
    "title": "Permanent product pages",
    "status": "Complete",
    "acceptance": "Each SKU has a direct product URL and descriptive metadata.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 16,
    "group": "Catalogue",
    "title": "Jewellery specification sections",
    "status": "Complete",
    "acceptance": "Product pages show material, weight, dimensions, origin, treatment and engraving fields.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 17,
    "group": "Catalogue",
    "title": "Stone-specific care",
    "status": "Complete",
    "acceptance": "Each gemstone family has an appropriate care and disclosure section.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 18,
    "group": "Catalogue",
    "title": "Related product discovery",
    "status": "Complete",
    "acceptance": "Related designs are selected from the same stone or engraving family.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 19,
    "group": "Catalogue",
    "title": "Truthful product structured data",
    "status": "Complete",
    "acceptance": "Product and breadcrumb JSON-LD omit invented offers, reviews and availability.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 20,
    "group": "Catalogue",
    "title": "Internal supplier data separation",
    "status": "Complete",
    "acceptance": "Supplier allocation and capacity are excluded from public product responses.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 21,
    "group": "Shopping",
    "title": "Animated header search",
    "status": "Complete",
    "acceptance": "The search icon transitions into the header input.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 22,
    "group": "Shopping",
    "title": "Live catalogue suggestions",
    "status": "Complete",
    "acceptance": "Typing returns matching catalogue designs and a view-all route.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 23,
    "group": "Shopping",
    "title": "Keyboard search and focus restoration",
    "status": "Complete",
    "acceptance": "Arrow keys, Enter, Escape and the close control support the header search.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 24,
    "group": "Shopping",
    "title": "Alternative spelling search",
    "status": "Complete",
    "acceptance": "Gemstone aliases, Imam-name variants, Urdu terms and SKU queries are recognised.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 25,
    "group": "Shopping",
    "title": "Combined catalogue filters",
    "status": "Complete",
    "acceptance": "Gemstone, metal, price and availability filters work together.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 26,
    "group": "Shopping",
    "title": "Sorting and empty results",
    "status": "Complete",
    "acceptance": "Name and price sorting and clear-filter empty states are available.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 27,
    "group": "Shopping",
    "title": "Persistent guest wishlist",
    "status": "Complete",
    "acceptance": "Saved designs survive reload and reject malformed or unknown entries.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 28,
    "group": "Shopping",
    "title": "Account wishlist and import",
    "status": "Complete",
    "acceptance": "Signed-in favourites are owner-scoped; guest import is idempotent and validated.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 29,
    "group": "Shopping",
    "title": "Selection bag and personalisation",
    "status": "Complete",
    "acceptance": "Customers select ring size and engraving before submitting an enquiry.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 30,
    "group": "Shopping",
    "title": "Customer design upload",
    "status": "Complete",
    "acceptance": "PNG, JPEG and WebP reference uploads are supported within size limits.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 31,
    "group": "Currency",
    "title": "Country-level currency detection",
    "status": "Complete",
    "acceptance": "A same-origin edge-country lookup chooses the default currency.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 32,
    "group": "Currency",
    "title": "Country-to-currency mapping",
    "status": "Complete",
    "acceptance": "Current CLDR mappings select supported local currencies for priority markets and other territories.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 33,
    "group": "Currency",
    "title": "Manual currency override",
    "status": "Complete",
    "acceptance": "A shopper can select a currency explicitly.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 34,
    "group": "Currency",
    "title": "Remembered currency preference",
    "status": "Complete",
    "acceptance": "Manual choices persist across reloads; automatic mode clears the manual choice.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 35,
    "group": "Currency",
    "title": "Safe automatic fallback",
    "status": "Complete",
    "acceptance": "Unknown country or failed detection defaults to PKR.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 36,
    "group": "Currency",
    "title": "Server-side exchange-rate cache",
    "status": "Complete",
    "acceptance": "Rates are fetched and cached by the server rather than exposing a raw rate feed.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 37,
    "group": "Currency",
    "title": "Agreed payment currency disclosure",
    "status": "Complete",
    "acceptance": "Catalogue conversions are estimates; the final quote records the exact charge amount and currency.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 38,
    "group": "Currency",
    "title": "Correct decimal handling",
    "status": "Complete",
    "acceptance": "Zero-decimal, three-decimal and PKR paisa rounding are handled separately.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 39,
    "group": "Currency",
    "title": "Rate freshness and expiry",
    "status": "Complete",
    "acceptance": "Dated fallback rates expire and unavailable estimates fall back to authoritative PKR display.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 40,
    "group": "Currency",
    "title": "Country lookup privacy",
    "status": "Complete",
    "acceptance": "No GPS request, precise coordinates or IP address is returned to the browser.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 41,
    "group": "Customer accounts",
    "title": "Customer account sign-in",
    "status": "Complete",
    "acceptance": "Customer account authentication remains separate from the email-based staff portal.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 42,
    "group": "Customer accounts",
    "title": "Owner-scoped customer records",
    "status": "Complete",
    "acceptance": "Customers can access only their own requests, uploads, favourites and quotes.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 43,
    "group": "Customer accounts",
    "title": "Idempotent design requests",
    "status": "Complete",
    "acceptance": "A stable request key prevents duplicate creation when the same submission is retried.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 44,
    "group": "Customer accounts",
    "title": "Request review timeline",
    "status": "Complete",
    "acceptance": "Customer-visible stages are recorded without exposing internal staff notes.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 45,
    "group": "Customer accounts",
    "title": "Detailed account quotes",
    "status": "Complete",
    "acceptance": "Accounts display exact proposed specifications, total, address, delivery date and expiry.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 46,
    "group": "Customer accounts",
    "title": "Account data export",
    "status": "Complete",
    "acceptance": "A private JSON record export is available; large exports disclose the assistance requirement.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 47,
    "group": "Customer accounts",
    "title": "Privacy request workflow",
    "status": "Complete",
    "acceptance": "Customers can request correction, deletion or export assistance through their account.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 48,
    "group": "Customer accounts",
    "title": "Browser data controls",
    "status": "Complete",
    "acceptance": "Guest selections can be cleared separately from account records.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 49,
    "group": "Customer accounts",
    "title": "Bounded request parsing",
    "status": "Complete",
    "acceptance": "JSON and upload bodies are bounded even without a Content-Length header.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 50,
    "group": "Customer accounts",
    "title": "Upload content validation",
    "status": "Complete",
    "acceptance": "Supported image signatures are checked and downloads use safe attachment headers.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 51,
    "group": "Backend",
    "title": "Supabase project provisioned",
    "status": "Complete",
    "acceptance": "A healthy Wilayah Stone project exists in the owner’s named organisation.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 52,
    "group": "Backend",
    "title": "Persistent Postgres schema",
    "status": "Complete",
    "acceptance": "Store records, private server credentials and controlled RPC functions are provisioned.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 53,
    "group": "Backend",
    "title": "Record access indexes",
    "status": "Complete",
    "acceptance": "Indexes cover kind, owner, creation time and record ID ordering.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 54,
    "group": "Backend",
    "title": "Anonymous database access denied",
    "status": "Complete",
    "acceptance": "RLS is enabled and browser roles have no direct table or RPC access.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 55,
    "group": "Backend",
    "title": "Private reference bucket",
    "status": "Complete",
    "acceptance": "The design-reference bucket is private and enforces MIME and size restrictions.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 56,
    "group": "Backend",
    "title": "Authenticated server bridge",
    "status": "Complete",
    "acceptance": "The store backend requires a server-only credential; no service secret is embedded in source.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 57,
    "group": "Backend",
    "title": "Existing records preserved",
    "status": "Complete",
    "acceptance": "The existing product override and audit record were migrated; transient rate/cache rows were excluded.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 58,
    "group": "Backend",
    "title": "Atomic record operations",
    "status": "Complete",
    "acceptance": "Insert-once and compare-and-set operations protect duplicates and concurrent updates.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 59,
    "group": "Backend",
    "title": "Atomic hourly rate limits",
    "status": "Complete",
    "acceptance": "Database-level counters limit authenticated writes and uploads.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 60,
    "group": "Backend",
    "title": "Database health endpoint",
    "status": "Complete",
    "acceptance": "A bounded health route reports availability without exposing configuration or records.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 61,
    "group": "Administration",
    "title": "Email-based company administrator signup",
    "status": "Complete",
    "acceptance": "The authorised company email account receives Store administrator access and completes first-visit role selection.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 62,
    "group": "Administration",
    "title": "Six staff roles",
    "status": "Complete",
    "acceptance": "Store administrator, catalogue manager, fulfilment, support, editor and viewer permissions are enforced by the server.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 63,
    "group": "Administration",
    "title": "Shared team access controls",
    "status": "Complete",
    "acceptance": "Store administrators can approve role requests and manage each other’s access; the last claimed active administrator is protected.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 64,
    "group": "Administration",
    "title": "Server-enforced permissions",
    "status": "Complete",
    "acceptance": "Every protected read and mutation checks its corresponding permission.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 65,
    "group": "Administration",
    "title": "Validated catalogue editor",
    "status": "Complete",
    "acceptance": "Staff can manage prices, specifications, supplier allocation and review state with server validation.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 66,
    "group": "Administration",
    "title": "Supplier creation and editing",
    "status": "Complete",
    "acceptance": "Capacity, lead days, evidence and reservation notes are stored in supplier records.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 67,
    "group": "Administration",
    "title": "Request review management",
    "status": "Complete",
    "acceptance": "Staff update review stages and private notes with concurrent-update protection.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 68,
    "group": "Administration",
    "title": "Journal publishing and editing",
    "status": "Complete",
    "acceptance": "Editors create, update, publish or unpublish plain-text articles.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 69,
    "group": "Administration",
    "title": "Support and privacy queues",
    "status": "Complete",
    "acceptance": "Authorised support staff manage incoming enquiries and privacy-request status.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 70,
    "group": "Administration",
    "title": "Administrative audit trail",
    "status": "Complete",
    "acceptance": "Administrative changes record action, role, record reference and timestamp.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 71,
    "group": "Operations",
    "title": "Versioned customer policies",
    "status": "Complete",
    "acceptance": "Help, FAQ, payment, shipping, refunds, care, privacy and terms pages are present.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 72,
    "group": "Operations",
    "title": "Quote prerequisites and expiry",
    "status": "Complete",
    "acceptance": "Quotes require reviewed products, pricing, sourcing, exact delivery terms and a future expiry.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 73,
    "group": "Operations",
    "title": "Bounded admin pagination",
    "status": "Complete",
    "acceptance": "Operational record lists load in pages rather than returning unlimited customer data.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 74,
    "group": "Operations",
    "title": "HTTP security controls",
    "status": "Complete",
    "acceptance": "Same-origin writes, no-store private responses, CSP, nosniff, referrer and permission policies are applied.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 75,
    "group": "Operations",
    "title": "SEO routing and crawl controls",
    "status": "Complete",
    "acceptance": "Canonical metadata, sitemap entries, published journal URLs and private-route noindex are maintained.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 76,
    "group": "Operations",
    "title": "Loading error and missing-page states",
    "status": "Complete",
    "acceptance": "Customers receive usable retry, loading and 404 screens.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 77,
    "group": "Operations",
    "title": "Responsive and reduced-motion styles",
    "status": "Complete",
    "acceptance": "Narrow-screen admin layouts, focus states and reduced-motion rules are provided.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 78,
    "group": "Operations",
    "title": "Automated checks and release build",
    "status": "Complete",
    "acceptance": "Core behaviour, authorization boundaries and the production build are checked before publication.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented; validation scope is recorded in the daily report."
  },
  {
    "id": 79,
    "group": "Operations",
    "title": "Online gateway removal",
    "status": "Complete",
    "acceptance": "Online gateway adapters, checkout controls and stored provider credentials are removed.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 80,
    "group": "Operations",
    "title": "Business inputs and workbook review",
    "status": "Complete",
    "acceptance": "All 22 workbook sheets have been structurally reviewed and mapped to the portal; unknown commercial facts remain blank.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 81,
    "group": "Business evidence",
    "title": "Legal seller identity",
    "status": "Outstanding",
    "acceptance": "Supply the legal business name, registration or sole-trader details, full address and customer contact.",
    "owner": "Business owner",
    "dependency": "Supply the legal business name, registration or sole-trader details, full address and customer contact."
  },
  {
    "id": 82,
    "group": "Business evidence",
    "title": "Final retail prices and cost approvals",
    "status": "Outstanding",
    "acceptance": "Approve stone, silver, labour, engraving, packaging, shipping, fee and margin calculations for each SKU.",
    "owner": "Business owner",
    "dependency": "Approve stone, silver, labour, engraving, packaging, shipping, fee and margin calculations for each SKU."
  },
  {
    "id": 83,
    "group": "Business evidence",
    "title": "Measured product specifications",
    "status": "Outstanding",
    "acceptance": "Provide verified silver weight, tolerances, stone dimensions and maker-approved ring sizes.",
    "owner": "Business owner",
    "dependency": "Provide verified silver weight, tolerances, stone dimensions and maker-approved ring sizes."
  },
  {
    "id": 84,
    "group": "Business evidence",
    "title": "Stone identity origin and treatment evidence",
    "status": "Outstanding",
    "acceptance": "Supply accurate sourcing, natural/synthetic status, treatments and any supporting laboratory evidence.",
    "owner": "Business owner",
    "dependency": "Supply accurate sourcing, natural/synthetic status, treatments and any supporting laboratory evidence."
  },
  {
    "id": 85,
    "group": "Business evidence",
    "title": "Actual product photography",
    "status": "Outstanding",
    "acceptance": "Supply compliant photographs of the actual items; concept images cannot establish product appearance.",
    "owner": "Business owner",
    "dependency": "Supply compliant photographs of the actual items; concept images cannot establish product appearance."
  },
  {
    "id": 86,
    "group": "Business evidence",
    "title": "Sacred-name artwork approval",
    "status": "Outstanding",
    "acceptance": "Approve exact spelling and production proofs for all forty-eight engraved variants.",
    "owner": "Business owner",
    "dependency": "Approve exact spelling and production proofs for all forty-eight engraved variants."
  },
  {
    "id": 87,
    "group": "Business evidence",
    "title": "Supplier reservation agreement",
    "status": "Outstanding",
    "acceptance": "Record allocation, reservation expiry, quality, pricing, exclusivity scope and remedies in agreed terms.",
    "owner": "Business owner",
    "dependency": "Record allocation, reservation expiry, quality, pricing, exclusivity scope and remedies in agreed terms."
  },
  {
    "id": 88,
    "group": "Business evidence",
    "title": "Maker capacity and production commitment",
    "status": "Outstanding",
    "acceptance": "Agree achievable production capacity and fixed lead times before promising delivery.",
    "owner": "Business owner",
    "dependency": "Agree achievable production capacity and fixed lead times before promising delivery."
  },
  {
    "id": 89,
    "group": "Business evidence",
    "title": "Courier rates service areas and insurance",
    "status": "Outstanding",
    "acceptance": "Confirm carrier jewellery acceptance, coverage for each offered destination, loss cover, rates and handling process.",
    "owner": "Business owner",
    "dependency": "Confirm carrier jewellery acceptance, coverage for each offered destination, loss cover, rates and handling process."
  },
  {
    "id": 90,
    "group": "Business evidence",
    "title": "Primary WhatsApp contact active",
    "status": "Complete",
    "acceptance": "Orders, enquiries and customer support use +92 370 5198895. The number is saved in the backend and the public email is removed.",
    "owner": "Implemented / store engineering",
    "dependency": "Provided by the company on 10 November 2026 and saved as 923705198895."
  },
  {
    "id": 91,
    "group": "Payments and launch",
    "title": "Manual receiving account instructions",
    "status": "Outstanding",
    "acceptance": "Management supplies the receiving account and supported manual methods directly to each customer after agreement.",
    "owner": "Business owner + engineering / provider",
    "dependency": "No receiving account is invented or publicly advertised by the website."
  },
  {
    "id": 92,
    "group": "Payments and launch",
    "title": "Manual receipt ledger",
    "status": "Complete",
    "acceptance": "The server validates the agreed currency, receipt reference, receiving-account check, balance and duplicate receipt attempts.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 93,
    "group": "Payments and launch",
    "title": "Manual order and fulfilment lifecycle",
    "status": "Complete",
    "acceptance": "An agreed order snapshot, atomic receipt ledger, supplier allocation, production, quality review, Karachi receiving and customer dispatch are connected.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 94,
    "group": "Payments and launch",
    "title": "Manual refund approval and repayment",
    "status": "Complete",
    "acceptance": "A named manager approves refunds; actual repayments are recorded against the original order and excess or duplicate refunds are rejected.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 95,
    "group": "Payments and launch",
    "title": "Customer communication workflow",
    "status": "Complete",
    "acceptance": "WhatsApp conversations and staff updates are handled manually. Account quote/order states and support responses are available; no automatic WhatsApp or email sending is claimed.",
    "owner": "Implemented / store engineering",
    "dependency": "Implemented and covered by the manual-order release checks; business acceptance remains a separate task."
  },
  {
    "id": 96,
    "group": "Payments and launch",
    "title": "Custom domain and sender DNS",
    "status": "Outstanding",
    "acceptance": "Provide the store domain and approved DNS access or records for domain and email verification.",
    "owner": "Business owner + engineering / provider",
    "dependency": "Provide the store domain and approved DNS access or records for domain and email verification."
  },
  {
    "id": 97,
    "group": "Payments and launch",
    "title": "Final consumer-policy approval",
    "status": "Outstanding",
    "acceptance": "Approve seller details, cancellation/refund handling, retention periods, service contacts and applicable legal requirements.",
    "owner": "Business owner + engineering / provider",
    "dependency": "Approve seller details, cancellation/refund handling, retention periods, service contacts and applicable legal requirements."
  },
  {
    "id": 98,
    "group": "Payments and launch",
    "title": "Review actual forward-sale contract",
    "status": "Outstanding",
    "acceptance": "Review the implemented offer, acceptance, receipt of full payment and non-delivery remedies with a qualified adviser.",
    "owner": "Business owner + engineering / provider",
    "dependency": "Review the implemented offer, acceptance, receipt of full payment and non-delivery remedies with a qualified adviser."
  },
  {
    "id": 99,
    "group": "Payments and launch",
    "title": "Email delivery and operational acceptance",
    "status": "Outstanding",
    "acceptance": "Configure company email delivery, complete a real email-code sign-in, and finish owner/staff/customer, device, restore and load acceptance checks.",
    "owner": "Business owner + engineering / provider",
    "dependency": "Complete owner/staff/customer sign-in, role revocation, real-device usability, backup restoration and load checks."
  },
  {
    "id": 100,
    "group": "Payments and launch",
    "title": "Controlled first paid-order acceptance",
    "status": "Outstanding",
    "acceptance": "After all prerequisites, complete an authorised end-to-end payment, fulfilment and refund acceptance exercise.",
    "owner": "Business owner + engineering / provider",
    "dependency": "After all prerequisites, complete an authorised end-to-end payment, fulfilment and refund acceptance exercise."
  }
];
