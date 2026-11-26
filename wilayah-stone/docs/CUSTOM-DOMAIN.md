# Wilayah Stone custom domain

Target: `https://wilayahstone.publicvm.com`.
Current working origin: `https://wilayah-stone.raza-4920618957.chatgpt.site`.

The existing custom-domain attachment was refreshed on 18 November 2026. Hosting returned `pending`, provider `active`, SSL `pending_validation`. The website remains public at the working origin. This is not a completed custom-domain activation.

Set these exact hosting records in the DNS panel for the selected hostname:

| Type | Full name | Value |
| --- | --- | --- |
| CNAME | wilayahstone.publicvm.com | custom-domains.chatgpt.site. |
| TXT | _openai-site-verification.wilayahstone.publicvm.com | openai-site-verification=IEaTRUeB4qyq7FG-E7cY4U8is29E0TPdgG078oKoj3U |

Some providers accept relative names such as `@` and `_openai-site-verification` when editing this hostname's zone. Use the full DNS name above as the reference. Preserve unrelated mail records. The hosting response had no second usable validation record; do not invent one. CNAME is the supplied routing instruction for this subdomain; the apex IPv4 targets are not substituted for it.

Native hosting validation, not an executor DNS failure, determines completion. After records propagate, refresh the existing domain attachment. Only after status is active and HTTPS works should `PUBLIC_SITE_ORIGIN` be switched to the target custom origin and a saved version deployed. Until then, canonical URLs and sitemap/robots references remain on the working origin for its requests. Requests actually arriving on the custom hostname receive matching absolute metadata URLs. Never canonicalize all working pages to an inaccessible hostname.

Authentication explicitly accepts both exact HTTPS origins with separate host-only sessions. Add the exact Google customer callback shown in `CUSTOMER-AUTH-SETUP.md`; Gmail sending authorization has its own `/auth/mail/callback`. No third-party callback is silently rewritten in Google Cloud.

For Resend, the company's dashboard supplies additional DKIM/SPF/MX records. Hosting validation records do not authorize email sending. No Resend DNS values or verification state are invented here.
