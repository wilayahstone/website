# Wilayah Stone — manual ordering release

Updated 10 November 2026. This release removes online payment gateways. No card provider, hosted checkout, bank redirect or payment webhook is active.

The existing company Site and audience are retained. The production database is the existing Supabase project, with private artwork storage and server-enforced staff roles.

## Operator setup

1. Open `/admin` with your work email after completing docs/EMAIL-ADMIN-SETUP.md. The authorised company signup becomes Store administrator; other role requests are approved in Team. Multiple administrators share management access.
2. The official WhatsApp number +92 370 5198895 is saved and enabled. Enter the real legal seller identity, address and contact before creating an agreed order.
3. Record actual suppliers, total agreed allocation and lead time. Assign actual product specifications and prices through Catalogue. Review artwork and product-only content in Operations → Design & content approval.
4. Test the customer’s selection-to-WhatsApp message with the official number. The customer reviews and sends it; opening the link does not create a sale or receipt.
5. Record the exact written agreement in Orders. Record verified funds in Operations → Manual payments. Do not begin production until the full receipt is recorded.
6. Track production, quality, supplier shipment, Karachi receiving, customer dispatch and delivery. Refund decisions and actual repayments use separate manager-controlled steps.

## Publication

Build and test the selected checkout with the installed Sites helpers, push that exact source through the authenticated source workflow, save the packaged version, and deploy it to the existing project. Keep private runtime values in hosting configuration, never source files. Do not create another Site or change its audience for this update.

## Evidence and limits

Automated checks use isolated in-memory records and never move money or send messages. Passing them establishes application behavior, not gemstone authenticity, courier acceptance, legal seller details or religious approval. The 100-item checklist preserves those outstanding business responsibilities. The attached workbook contains a clean operational template rather than populated product or customer data; see WORKBOOK_REVIEW.md.

Actual domain/DNS changes, supplier contracts, receiving-account instructions and the official business phone remain management inputs. Historical reports in this repository describe earlier work and are not current gateway setup instructions.
