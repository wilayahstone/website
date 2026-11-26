# Catalogue imagery

The collection uses two individual views for each of 52 rings: 12 models each for Aqeeq, Firoza, Durr-e-Najaf and Hadeed-e-Chini, plus plain Yaqoot, Peridot, Emerald and Marjaan rings. Each model has front and detail views, with 480 px and 960 px WebP delivery files in `public/assets/products`. The detail view was generated using the corresponding front view as its reference, preserving the ring, inscription, lighting and studio backdrop.

`prompts.json` records the original selected prompts, product identifiers, Arabic inscriptions and source image filenames. `gallery-prompts.json` records the exact prompts and references for the 52 detail views and eight loose gemstone renders. `gallery-records/` records their source hashes and delivery sizes. All imagery was made with the built-in image generation tool. A second generation corrected the Aqeeq Hasan inscription to one connected word. The final delivery files retain the selected correction.

These assets are renders for rings made to order. They do not establish physical stock, stone origin, metal assay, stone treatments, manufacturing measurements or gemstone certification. Product pages and product options describe their role clearly without overlays on the images.

The shared image component supplies responsive sizes, meaningful alternative text, lazy loading for cards, high priority for the main product image and a reserved square aspect ratio. Collection cards reveal the second view on hover or keyboard focus once it has loaded. Product galleries offer thumbnails, swipe navigation and an accessible zoom dialog. Product metadata uses both ring views for Open Graph, Twitter and Product structured data.

The homepage gemstone section uses eight transparent three-dimensional gemstone renders, delivered at 384 px and 768 px in `public/assets/stones`. Reveal and hover effects respect reduced-motion preferences.

Image review covered all four engraved families, the four plain models and all eight gemstones. The 11 November 2026 delivery check found 104 distinct full-size ring views, 208 responsive product files and 16 responsive gemstone files, totaling 13,590,846 bytes. The largest WebP is 114,208 bytes. Every image decoded with the expected dimensions, and all gemstone files preserved transparency. The existing 65 store and production checks passed, as did TypeScript checking. Browser checks covered the second-view swap, nested zoom, keyboard handling and WhatsApp size handoff, including a 390 px mobile layout.

Original generated PNGs are left unchanged. `scripts/prepare-product-image.py` and `scripts/prepare-gallery-image.py` create only the WebP delivery versions.
