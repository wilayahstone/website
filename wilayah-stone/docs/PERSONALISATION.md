# Personalisation page

Added 12 November 2026 at `/personalisation`. The old `/custom` route redirects here. Navigation, the homepage Create your ring action, product pages, product windows and the footer link to it. Product links carry an initial catalogue design and consume that query parameter so subsequent reloads can restore the customer’s choices.

The four steps cover stone, engraving, fit and a reviewed brief. Only catalogue variants not marked Unavailable can be selected. Name engraving selects the matching SKU; an unavailable Imam variant is never silently replaced. Plain and custom engraving show a clearly described catalogue setting reference. Preview images are existing catalogue renders, not live engraving simulations.

The browser draft contains choices and notes, with versioned validation. It excludes the account request’s name, email, delivery country and file bytes. The Account clear-browser action removes the draft. Image-only custom drafts resume at the engraving step because local files do not survive a reload or authentication navigation.

The primary handoff prepares a WhatsApp message for the configured store contact. It never sends a message. The customer reviews it and attaches their image in WhatsApp. No gateway, quoted price or delivery promise is invented.

Signed-in customers can save the brief through the existing `/api/store` request action. Artwork first uses its existing private upload path, with the original owner checked at request creation and download. Requests remain idempotent on retry, appear in the staff Requests inbox, and retain size help, exact engraving text, notes and the design download. The final written specification, proof, quote and delivery date remain part of the atelier’s agreement process.

Automated coverage includes all 52 catalogue starting points, unavailable variants, exact Arabic wording, sizing help, malformed or stale drafts, backend payload limits, idempotency, artwork ownership and authorised staff access. Direct email OTP delivery requires the company’s verified sender and mail API key.
