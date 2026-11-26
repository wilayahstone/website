# Store management

Open `/admin` and enter the company's store access code. The Overview provides direct shortcuts to the main management screens.

- `/admin#catalogue`: create products, edit SKU, name, description, sourcing and specifications, upload main/detail images, publish/unpublish, or move products to the recycle bin.
- `/admin#journal`: create/edit articles and SEO, choose a catalogue cover or upload an original cover with accessible description, publish/unpublish, or delete an article.
- `/admin#orders`: record agreed WhatsApp orders, receipts and fulfilment updates through the operational screens.
- `/admin#recycle-bin`: restore deleted catalogue and business records.
- `/admin#email-delivery`: manage optional outgoing store mail. Customer registration and sign-in are available independently at `/account`.

Product URLs and order references use a stable product identity; editing the displayed SKU does not rewrite previous order snapshots. Stock codes remain reserved for the product that used them. New products remain drafts until published; front and detail images are required for publication. New products participate in search, wishlists, requests, personalisation, quotes and manual-order product selection.

Article and product uploads use the private storage bridge. The public media route serves an image only while a published article or product references it; authenticated staff can preview draft images. Customer artwork cannot be used as public media by changing its identifier.

Source edits remain in the Sites project repository. The store portal manages business data and content; it does not execute uploaded code or edit runtime application source.
