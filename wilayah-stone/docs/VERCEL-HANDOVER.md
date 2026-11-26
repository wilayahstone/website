# Wilayah Stone — GitHub and Vercel handover

The live Site and this source snapshot contain the same application changes. Vercel deployment is planned for 26 November 2026; it has not been performed by creating this archive.

## What is included

Frontend and server API source, admin portal, customer email/password account flow, Supabase Edge Function source and database schema SQL, catalogue/content source, local product and brand assets, tests, package lockfile and Vercel configuration. The Node adapter keeps Supabase as the database and storage backend. No Shopify or online payment gateway is involved.

This is a source-and-assets backup, not a full snapshot of the remote Supabase database, authentication users or uploaded Storage objects. Existing customer accounts, orders, uploaded artwork, media and settings remain in the existing Supabase project. Keep that project and the existing Edge Function; changing the website host does not require a new database. To make a separate database recovery backup, use the company Supabase dashboard backup/export facilities and copy Storage objects separately. Store database backups privately, outside GitHub.

Live credentials, session cookies and production customer data are deliberately excluded from the GitHub-ready ZIP. `.env.example` lists the required settings. Copy the existing runtime secrets privately from the current host into Vercel Environment Variables. Never commit `.env.local`, bridge/service keys, shared admin codes or database dumps.

## Tomorrow's deployment

1. Create the company-owned GitHub account/repository and upload the extracted project directory. Keep the repository private while company source and asset permissions are being managed.
2. In Vercel, import that repository, select Next.js, and use the root project directory. `vercel.json` supplies `pnpm run build:vercel`; use Node 22 or a later compatible Node release and the pinned pnpm version in package.json. Do not select a static export or upload the Cloudflare dist folder.
3. Add the settings in `.env.example` to the Production environment. Keep DATA_BACKEND=supabase. Reuse SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_BRIDGE_KEY, EMAIL_OTP_SECRET and the shared administrator settings. On Vercel, use SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY as a server-only secret. With this update the Node backend can call Supabase directly, so SUPABASE_BRIDGE_KEY is optional. Never expose a server key through NEXT_PUBLIC_ variables. Set ADMIN_ACCESS_MODE=shared_code.
4. Set ADMIN_AUTH_ORIGIN and PUBLIC_SITE_ORIGIN to the exact final HTTPS origin. Put any deliberately supported additional HTTPS origins in the comma-separated ADMIN_AUTH_ALLOWED_ORIGINS list. Do not allow wildcard preview hosts. Preview deployments must have explicitly configured origins if account access is required.
5. Deploy. Open `/api/health`, `/collection`, `/account`, `/personalisation` and `/admin`. Check account creation/sign-in/sign-out, private request ownership, editing a draft, publication scheduling, a variation selection, quantity pricing, uploads, journal editing and WhatsApp messages. Do not create real test sales or claim payment has been received.
6. Add the chosen custom domain in Vercel and apply the exact DNS records Vercel provides. Wait for domain and HTTPS activation, then update both origin settings and redeploy. Test on the final domain before redirecting the previous host or announcing the move.
7. Preserve the current host and source snapshot until the company has checked the Vercel deployment. Users sign in again on a new domain; their Supabase account UUID and records remain unchanged.

## Product controls

Catalogue editor: Product attributes, Product variations, Volume pricing, Schedule your listing, Save as draft and Publish. Attributes can be displayed as specifications or copied into variation options. Variation prices remain private until public price display is enabled. Publishing a scheduled listing requires the same complete fields/images as immediate publication.

Scheduling stores an absolute UTC instant. The editor accepts the administrator's local date/time. Public database-backed reads check that instant on each request, so no paid cron service is required. A scheduled listing becomes visible on the first request at or after the chosen time; draft/archive states always remain hidden. Images, direct product URLs and request submissions follow the same availability rule.

Quantity tiers are product-specific and editable without code. Different variations of the same product count together. The highest qualifying tier applies once, excluding shipping. Public amounts appear only for deliberately public catalogue prices; otherwise customers see the saving percentage and request a quotation. Staff quotes and manual orders calculate the discount from unit prices in the agreed currency. PKR starts from internal catalogue prices; foreign-currency unit prices are entered by staff. The server verifies the final discounted total and stores the pricing agreement. Historical quotes/orders retain their recorded pricing after later tier edits.

## Source and build checks

`pnpm run build:vercel` builds standard Next.js for Vercel. The existing Sites publication continues to use its Vinext/Cloudflare build. Runtime aliases select the correct server environment adapter for each host. `node --test tests/*.test.mjs` runs isolated fixtures without changing live orders or listings. `tests/variations-db.sql` is a transactional integration check which rolls back its synthetic data.

## Official references

https://vercel.com/docs/project-configuration/vercel-json
https://vercel.com/docs/environment-variables
https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack
