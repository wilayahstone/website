import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import Store from '../store';
import {policies} from '../../lib/catalog';
import {legacyJournalSlugs} from '../../lib/journal';
import {getRecord} from '../../lib/server/data';
export const dynamic='force-dynamic';
const titles:Record<string,string>={collection:'Men’s 925 Silver & Gemstone Rings',journal:'Gemstones, Engraving & Honest Craftsmanship',wishlist:'Your Saved Ring Designs',bag:'Your Ring Design Selection',account:'Your Design Requests',launch:'Wilayah Stone Website Launch',checkout:'Review Your Ring Specification',payment:'Payment Status'};
export async function generateMetadata({params}:{params:Promise<{page:string}>}):Promise<Metadata>{const {page}=await params;const post=page.startsWith('post-')?await getRecord(page.slice(5),'post'):null;const title=(post?.data.published?post.data.title:null)||titles[page]||policies[page]?.title||'Wilayah Stone';return {title:`${title} | Wilayah Stone`,alternates:{canonical:`/${page}`},description:(post?.data.published?post.data.body.slice(0,160):null)||policies[page]?.body[0]||'Explore men’s gemstone rings, sacred-name engraving and transparent made-to-order jewellery for a global community.',robots:['account','bag','wishlist','checkout','payment'].includes(page)?{index:false,follow:false}:{index:true,follow:true},openGraph:{title:`${title} | Wilayah Stone`,url:`/${page}`,images:['/assets/logo.png']}};}
export default async function Page({params}:{params:Promise<{page:string}>}){const {page}=await params;if(legacyJournalSlugs[page])permanentRedirect('/journal/'+legacyJournalSlugs[page]);if(page.startsWith('post-')){const post=await getRecord(page.slice(5),'post');if(!post?.data.published||post?.data.archivedAt||!post?.data.slug)notFound();permanentRedirect('/journal/'+post.data.slug);}if(!titles[page]&&!policies[page]&&!page.startsWith('post-'))notFound();return <Store initialPage={page}/>}
