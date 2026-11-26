import type {Metadata} from 'next';
import Store from '../store';

const title='Personalise Your Silver & Gemstone Ring | Wilayah Stone';
const description='Create your personal ring brief. Choose from eight gemstones, Twelve-Imam name engraving or your own artwork, find your fit and speak with the Wilayah Stone atelier.';
export const metadata:Metadata={title,description,alternates:{canonical:'/personalisation'},openGraph:{title,description,url:'/personalisation',images:[{url:'/assets/products/ws-101-960.webp',width:960,height:960,alt:'Aqeeq ring with Imam Ali name engraving — design render'}]},twitter:{card:'summary_large_image',title,description,images:['/assets/products/ws-101-960.webp']}};
export default function Page(){return <Store initialPage="personalisation"/>;}
