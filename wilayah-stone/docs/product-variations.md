# Product variations

Admin portal → Products & catalogue → Add product or Edit → Product variations.

Add Colour, Size, Material, Style or a custom option. Enter one value per line, then generate missing combinations or add individual combinations. Set each row's SKU, price in PKR and availability. Blank SKUs are assigned when saved; a blank price inherits the parent internal price, otherwise the ring uses a quotation. Generating again preserves existing rows and entered prices/SKUs.

Save as draft permits unfinished options and combinations. Publishing requires named options, values and at least one complete available combination. Option names, values, combinations and SKUs must be unique. Limits are six option groups, thirty values per group, two hundred combinations and two decimal places for prices.

The storefront shows quotations by default. Turn on **Show variation prices on the storefront** to display amounts. Unavailable combinations cannot be selected. Size/Ring size/Ring size (US) options supply the ring size directly; products without them keep the standard ring-size selector. Material/Metal options appear in the personalisation brief and order snapshot. Product links and parent catalogue references stay stable.

Selections travel through the product page, quick view, selection bag, personalisation brief, account design request, quote, manual order and WhatsApp message. Request/quote/order snapshots preserve agreed option names, values, SKU, size and exact engraving after catalogue edits. Changed customer selections need review before a new request. Prices, suppliers and capacities remain private unless public price display is deliberately enabled.

Supabase migration `catalogue_product_variations` defines `ws_save_catalogue_product`. The server-only bridge uses it to commit the product and all SKU claims atomically. Historical SKUs stay reserved for their original product and variation; removed/renamed rows do not release them. Execution is restricted to service_role, with SECURITY INVOKER and an empty search path. No new client credentials or customer permissions are required.

Validation: TypeScript, the Node regression suite, transactional database checks with rollback, and browser interaction checks of generating combinations, preserving entered data, selecting options, unavailable values and selected payloads. Browser-only review routes are removed before release. No sample products are added to the live catalogue.

## Attributes, scheduled publication and volume pricing

The catalogue editor also supports thirty product attributes, including Color, Item Length, Metal, Number of Gemstones, Main Stone Depth, Main Stone Length, Main Stone Width, Theme and custom fields. Attributes are shown as specifications; copying one into variation options makes its values selectable.

Schedule listing saves a complete product privately until its chosen local date/time, stored as UTC. The public listing, direct product route and media eligibility check the timestamp on each database-backed read. No paid cron job is required. Publish/Save changes publishes immediately and clears a schedule; Save as draft hides the listing and clears its schedule. Scheduled listings have a dedicated admin filter.

Quantity discounts are optional per product. Admins can use the 2/10%, 3/15%, 4/20% preset or edit minimum quantities and percentages. The highest qualifying tier applies to all variations of one product; it excludes shipping and does not stack. The bag supports up to 100 rings. Customer quantities, WhatsApp messages, admin quotes and manual order records preserve quantities and savings. Foreign-currency quotes use staff-entered unit prices in that currency; the server recalculates the discounted total rather than trusting a submitted total. Agreements retain their pricing snapshot after later product edits.
