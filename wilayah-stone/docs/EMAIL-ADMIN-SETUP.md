# Staff email OTP

Updated 12 November 2026. Private staff guide.

Open `/admin`, enter your approved work email and choose Send email code. Enter the six-digit code in the same browser within five minutes. No password or social provider is used. Setup for the shared sender is in `CUSTOMER-AUTH-SETUP.md`.

`wilayahstone@gmail.com` retains its active Store administrator approval. Complete the role step if shown. New staff cannot approve themselves: an existing administrator approves requests in Team. Multiple administrators have equal permissions. The final claimed active administrator cannot be removed or demoted.

Authentication is backed by private, revocable opaque sessions. Supabase Auth is no longer part of the website sign-in path. No staff approval, identity binding or customer record is granted based on a browser-supplied role or matching unverified email.
