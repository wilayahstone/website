import type {Metadata} from 'next';
import Store from '../store';
import {getJournalPosts} from '../../lib/server/journal';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'The Journal | Gemstone Rings, Engraving & Care | Wilayah Stone',description:'Explore gemstone ring guides, Twelve-Imam engraving, 925 silver care and the made-to-order journey in the Wilayah Stone Journal.',alternates:{canonical:'/journal'},openGraph:{title:'The Wilayah Journal',description:'Meaning, in the details. Stone stories and considered craftsmanship.',images:['/assets/our-story-1536.webp']}};
export default async function Page(){return <Store initialPage="journal" initialPosts={await getJournalPosts()}/>}
