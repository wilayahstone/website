# Vercel runtime authentication fix

The supplied deployment log shows a successful build. Runtime configuration caused the failure: the shared administrator implementation expects `ADMIN_ACCESS_MODE=shared_code` (the previous `shared` instruction was incorrect), and the old data transport required a private Sites bridge key which is not the Supabase API key.

## Apply the release

1. Replace the matching files in the GitHub repository's `wilayah-stone` folder using this patch. Commit to the production branch. The patch includes source files and tests; it contains no live credentials.
2. In Vercel → Project → Settings → Environment Variables, import the separate PRIVATE `.env` file into Production. Keep this file outside the repository. Mark ADMIN_SHARED_CODE and EMAIL_OTP_SECRET as Secret.
3. Keep the existing SUPABASE_PUBLISHABLE_KEY and either SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY set to real values from the existing project. Server keys must remain private, with no NEXT_PUBLIC_ prefix. The private import does not overwrite those API keys. Remove empty placeholder server keys or replace them with the correct project values.
4. Redeploy the latest commit. Framework Next.js, build `pnpm run build:vercel`, output `.next-vercel`. The patch also records the output directory in vercel.json. The root directory remains the repository folder containing package.json.
5. Check `/api/health` → `{"status":"ok"}`, `/auth/admin/status` → configured true and method shared_code, and `/auth/customer/status` → password true. Then try the admin code and create/sign in/sign out of a customer account at https://wilayahstone.vercel.app.

## What changed

The server adapter recognizes Supabase URL/publishable/anon aliases and the service-role key alias already present in the user's Vercel settings. It accepts `shared` as a compatibility alias for `shared_code`. When Vercel system variables are enabled, its trusted production hostname can supply the default official HTTPS origin; request headers never grant a new trusted origin. Explicit origin settings remain supported.

The Vercel Node backend supports database RPCs, records, private Storage and immediate email/password customer creation directly using the server-side Supabase credential. The Cloudflare/Sites bridge remains available on the old host. Admin/customer authorization and record ownership checks remain in the existing routes. Customer sign-in uses the publishable key and native Supabase sessions; the server key is never sent to a browser. No Google, email OTP or ChatGPT authentication is required for the active flows.

No database schema or RLS changes were made. Existing products, customer accounts and orders remain in the current Supabase project.

Validation: 173 isolated automated tests and TypeScript, plus the standard Next.js production build. Live Supabase schema/RPC availability was checked read-only. Live Vercel signup/login cannot be verified until the company applies the code and private runtime settings. The repository and Vercel project are not authenticated in this workspace, so this package does not itself push or deploy to those accounts.
