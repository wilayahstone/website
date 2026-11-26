# Customer accounts

Updated 19 November 2026.

At `/account`, customers choose **Create account**, enter an email address and password, and are signed in immediately. The account shows a prominent **Sign out** button and hides the registration and login forms. Signing out revokes that browser session, clears private account state and returns to the sign-in form. If account creation succeeds while session creation is unavailable, the form offers sign-in with the email prefilled. Returning customers sign in with the same credentials. A mailbox confirmation, email sender and Google OAuth project are unnecessary for this flow.

The store checks input, rate limits and the request origin. Its private Supabase bridge creates the Auth user with immediate activation. Supabase manages the password hash. The public client cannot create privileged users, request a role or supply account metadata through the store. Registration cannot replace an existing password. A supplied address is a login name and does not establish ownership of a mailbox or earlier customer records.

Password sign-in uses Supabase Auth. First-party Secure, HttpOnly cookies carry the customer session. The store verifies the user with Supabase and checks the native session and its store-host binding before reading private records. Store access expires after eight hours. Sign-out revokes the current browser session. The store administrator signs in separately at `/admin`.

Store hosting supplies `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_BRIDGE_KEY` and the list of allowed store origins. The service-role key stays in the Supabase Edge Function environment. Passwords and tokens must never appear in application logs, profile records or analytics.
