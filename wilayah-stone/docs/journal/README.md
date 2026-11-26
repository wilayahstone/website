# Journal launch content and publishing

Six original articles were written and inserted into Supabase on 11 November 2026. `launch-articles.json` preserves their initial text, stable IDs, URLs and SEO fields. The live database is authoritative after staff edits; do not automatically reseed or overwrite edited articles at runtime.

Staff with `journal.write` can create articles, edit their body and excerpts, choose a catalogue cover, change their search title and description, and publish or unpublish them. Published URLs stay stable. Stale edits are refused, and a database unique index prevents duplicate article URLs. Administrators can move articles into Recycle bin and restore them.

The public index, homepage cards, article routes, metadata, social previews, structured BlogPosting data and sitemap read the same published records. Drafts, archived records and future publication dates are excluded. Article text is rendered as text with supported headings and safe HTTPS links; arbitrary HTML is never executed.

Initial articles:

- Choosing a gemstone ring
- The Twelve-Imam Collection and engraving
- 925 silver ring care
- Choosing an Aqeeq ring
- Firoza and turquoise ring care
- The made-to-order ring journey

Gemological care statements were checked against GIA and Tiffany & Co. primary guidance. Links are included with the relevant articles. The articles do not invent religious narrations, material certificates, health effects, completed transactions or customer reviews.
