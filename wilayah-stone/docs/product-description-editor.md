# Product description editor

Open the store workspace, choose Products & catalogue, then Edit product or Add product.

- Select text before applying bold, italic, underline, font size, colour or a link. The colour picker supports any custom colour. Custom colour also accepts colour names, hex, RGB/RGBA, HSL and modern CSS colour formats, including transparency. Pasted system-palette colours such as WindowText are supported.
- Text style offers paragraphs and heading levels 2–4. The product name remains the page’s main heading.
- Align paragraphs left, centre or right. Paragraph spacing offers compact, comfortable and generous spacing.
- Use bullet or numbered lists. Enter starts another paragraph or list item; Shift + Enter inserts a line break. Undo and redo are available in the toolbar and through normal keyboard shortcuts.
- Use Insert or edit image for a PNG, JPEG or WebP up to 5 MB. Supply useful alt text and an optional caption. Select an inserted image to change its image, alt text or caption, or remove it from the description.
- Reading preview uses the same safe renderer as customer product pages. Saving captures the current editor content together with the other product fields. A discard prompt protects unsaved changes when closing the editor.
- Save as draft accepts incomplete names, descriptions, specifications and product images. Saved drafts are private and appear in the Drafts filter; choose Resume draft to continue with the same product reference and SKU.
- Create & publish product or Publish product checks the publication requirements and explains missing details in the editor. A blank SKU is assigned automatically. Completed saves open the matching Drafts or Published list and clear the search so the saved product is visible.
- Save changes updates a published listing. Save as draft changes that product to private until it is published again. Draft saving does not bypass image ownership, content safety, access controls or stale-edit checks.

Descriptions support up to 12,000 text characters and eight inline images, separately from the main and detail gallery images. Existing plain descriptions stay editable without a bulk migration. The editor loads on demand only while editing a product.

## Storage and access

`descriptionRichText` is an optional structured document in the existing Supabase product record’s JSON data. `description` remains plain text derived on the server from that document, for search and SEO. A legacy caller that changes plain `description` while omitting `descriptionRichText` intentionally converts that description back to plain text; omitting the field with unchanged text preserves its formatting. An explicit null clears the structured version.

The server allows only known document nodes, safe styles and links, and bounded size/depth. Customer pages render React elements and never insert description HTML. External and data-URL description images are unsupported. Inline images must reference authenticated, store-owned catalogue uploads. Images become public only when a published, active product references them, and return to private access when every such reference is removed, unpublished or archived. Previously downloaded copies cannot be recalled. Private customer design artwork is never accepted as catalogue media.

Product edits retain the existing administrator authentication, audit trail, SKU rules and optimistic concurrency checks. No database migration, additional service credentials, paid editor service or public authentication changes are required.

Draft completeness and publication are separate validations. Both use the existing Supabase product records and media store; drafts are excluded from the public catalogue, product routes, search, wishlist selection and public image access. Partial updates preserve other saved fields. Unsafe or oversized content is rejected in drafts as well as published listings.
