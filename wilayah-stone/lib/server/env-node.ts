// Next.js/Vercel server adapter. Never import this module in a client component.
export const env={HOSTING_PLATFORM:'node',...process.env,DATA_BACKEND:process.env.DATA_BACKEND||'supabase'};
