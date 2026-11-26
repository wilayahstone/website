import {publicSiteOrigin} from '../../lib/server/site-origin';
import {policies} from '../../lib/catalog';
import {getProducts} from '../../lib/server/products';
import {getJournalPosts} from '../../lib/server/journal';
export const dynamic='force-dynamic';
export async function GET(req:Request){const base=publicSiteOrigin(req),posts=await getJournalPosts();const paths=[...new Set(['','collection','personalisation','journal','launch',...Object.keys(policies),...(await getProducts()).map(p=>`product/${p.id}`)])];const urls=paths.map(p=>`<url><loc>${base}/${p}</loc></url>`).concat(posts.map(p=>`<url><loc>${base}/journal/${p.data.slug}</loc><lastmod>${new Date(p.updated).toISOString()}</lastmod></url>`));return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}})}
