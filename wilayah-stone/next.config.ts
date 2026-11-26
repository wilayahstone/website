import type {NextConfig} from 'next';
import path from 'node:path';
const securityHeaders=[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
 {key:'Strict-Transport-Security',value:'max-age=31536000'},
 {key:'X-Frame-Options',value:'SAMEORIGIN'},
 {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests"},
];
const nextConfig:NextConfig={
 poweredByHeader:false,
 distDir:process.env.WS_NATIVE_NEXT==='1'||process.env.VERCEL==='1'?'.next-vercel':'.next',
 typescript:{tsconfigPath:'tsconfig.vercel.json'},
 webpack(config){config.resolve.alias={...config.resolve.alias,'@store/runtime-env':path.resolve(process.cwd(),'lib/server/env-node.ts')};return config},
 async headers(){return [{source:'/:path*',headers:securityHeaders},...['admin','account','bag','wishlist','api','auth'].map(prefix=>({source:`/${prefix}/:path*`,headers:[{key:'Cache-Control',value:'private, no-store'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]}))]},
};
export default nextConfig;
