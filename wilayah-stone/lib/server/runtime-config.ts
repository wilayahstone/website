/** Normalize server-owned deployment settings. Never derives trust from request headers. */
export function nodeEnvironment(input:Record<string,string|undefined>){
 const raw=Object.fromEntries(Object.entries(input).map(([key,value])=>[key,value?.trim()]));
 const vercelHost=raw.VERCEL_PROJECT_PRODUCTION_URL;
 const vercelOrigin=raw.VERCEL==='1'&&vercelHost&&/^[a-z0-9][a-z0-9.-]*\.vercel\.app$/i.test(vercelHost)?'https://'+vercelHost:undefined;
 const origin=raw.ADMIN_AUTH_ORIGIN||raw.PUBLIC_SITE_ORIGIN||vercelOrigin;
 return {...raw,HOSTING_PLATFORM:'node',DATA_BACKEND:raw.DATA_BACKEND||'supabase',
  SUPABASE_URL:raw.SUPABASE_URL||raw.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY:raw.SUPABASE_PUBLISHABLE_KEY||raw.SUPABASE_ANON_KEY||raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||raw.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SECRET_KEY:raw.SUPABASE_SECRET_KEY||raw.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_ACCESS_MODE:raw.ADMIN_ACCESS_MODE==='shared'?'shared_code':raw.ADMIN_ACCESS_MODE,
  ADMIN_AUTH_ORIGIN:origin,PUBLIC_SITE_ORIGIN:raw.PUBLIC_SITE_ORIGIN||vercelOrigin||origin,
  ADMIN_AUTH_ALLOWED_ORIGINS:[raw.ADMIN_AUTH_ALLOWED_ORIGINS,vercelOrigin].filter(Boolean).join(',')};
}
export function hasServerConnection(env:{SUPABASE_URL?:string;SUPABASE_BRIDGE_KEY?:string;HOSTING_PLATFORM?:string;SUPABASE_SECRET_KEY?:string}){return !!env.SUPABASE_URL&&!!(env.SUPABASE_BRIDGE_KEY||env.HOSTING_PLATFORM==='node'&&env.SUPABASE_SECRET_KEY)}
