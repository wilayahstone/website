# Business workbook review — 10 November 2026

Source: `Wilayah_Stone_Complete_Business_Management.xlsx`, supplied with this request. Reviewed read-only; the original file is unchanged.

## Findings

- 22 visible sheets and 95,991 formulas. Formula cells have no cached calculated results in the supplied file. This is not evidence of formula errors, but those results cannot be certified from cached output.
- No broken `#REF!` formula tokens, missing referenced sheets or external workbook links were found in the structural audit.
- No embedded product photographs or other workbook media.
- No actual product names, SKUs, selling prices, measured stone/silver specifications, suppliers, customer records, orders, receipts, production jobs, shipment records, campaigns or expenses. The Product Catalogue’s repeated `925 Sterling Silver` entry is a default, not 500 stock records.
- No official store WhatsApp number, legal seller address, receiving account or real exchange rates other than PKR=1. Management markup and low-stock thresholds are blank.
- The guide expressly states that unknown prices, rates, suppliers and specifications are blank and that refunds/religious approvals require management decisions.

## Controls translated to the website

Men’s rings initially; 925 silver as the intended material; full upfront receipt before supplier production; supplier-to-Karachi shipment; Karachi customer dispatch; Skardu customer coordination; named refund decisions; manual exchange rates for reporting; separate physical stock and supplier allocations. The newer instruction removes online gateways, including card acceptance: payment methods listed in a template dropdown are not evidence of a live merchant facility.

| Workbook sheet | Application area |
| --- | --- |
| START HERE | README, Reports operating guide |
| Executive Dashboard | Overview, Reports |
| Product Catalogue | Catalogue, product pages, Quotes and immutable Orders |
| Gemstone Database | Operations → Gemstone stock |
| Supplier Database | Suppliers and confirmed order allocation |
| Cost & Pricing | Operations → Cost & pricing |
| Order Management | Orders, order history, account quotes |
| Custom Design Requests | Requests, private artwork uploads and approved proof references |
| Manufacturing Tracker | Operations → Manufacturing |
| Customer Database | Operations → Customers and order customer details |
| Payment Management | Operations → Manual payments (immutable receipt ledger) |
| Shipping & DHL | Operations → Shipping & DHL, with separate supplier/customer stages |
| Marketing Tracker | Operations → Marketing |
| Listing Management | Operations → Listing management |
| Support & After-Sales | Enquiries, Operations → After-sales |
| Refunds & Complaints | Operations → Refunds & complaints |
| Expense Management | Operations → Expenses |
| Shariah & Approval | Governance, Operations → Design & content approval |
| Settings | Protected store Settings and Team roles |
| Inventory Overview | Reports → Gemstone inventory; supplier allocations remain separate |
| Monthly Reports | Monthly/all-activity cash reports by currency; workbook formulas are not copied into sales records |
| Formula Guide | README, cost breakdowns and report calculation notes |

## Workbook risks to address before relying on its financial outputs

1. `Order Management!AC6` and `Payment Management!N6` sum receipts by order while ignoring the receipt currency; the workbook separately warns about currency differences. The website rejects a receipt in a different currency rather than mixing amounts.
2. Product prices and specifications in historical workbook orders are live catalogue lookups. Later catalogue edits can alter earlier order values. The website stores the agreed order snapshot.
3. The workbook’s payment-status formula can continue to say Paid after a partial refund because it compares gross receipts with the original order amount. The website’s production gate uses receipts less repayments and exposes refund status separately.
4. Worksheet IDs are tied to row positions. The guide prohibits deleting/sorting rows in ways that break those relationships. The website uses stable identifiers, role-scoped access and change history.
5. An empty exchange rate must not silently become a plausible converted zero. The website shows unconverted totals and identifies missing rates.

This structural review does not claim recalculation of all 95,991 formulas or certification of accounting, shipment availability, gemstone identity or religious compliance. No workbook sample/template rows were imported as real trading records.
