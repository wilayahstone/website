import {publicSiteOrigin} from '../../lib/server/site-origin';
export function GET(req:Request){return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth/\nDisallow: /api/\nDisallow: /account\nDisallow: /checkout\nDisallow: /payment\nDisallow: /bag\nDisallow: /wishlist\nSitemap: '+publicSiteOrigin(req)+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain'}})}
