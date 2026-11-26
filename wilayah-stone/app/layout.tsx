import type {Metadata} from 'next';
import './globals.css';
import './motion.css';
import './header.css';
import './mobile.css';
import './support.css';
import './operations.css';
import './product-imagery.css';
import './gallery.css';
import './launch-update.css';
import './personalisation.css';
import './product-description.css';
import './variations.css';
import {OrderingProvider} from './components/whatsapp';
import {publicContact} from '../lib/contact';
import {pageOrigin} from '../lib/server/page-origin';
export async function generateMetadata():Promise<Metadata>{return {metadataBase:new URL(await pageOrigin()),title:'Wilayah Stone | Love and wilayah in every hand.',description:'Meaningful men’s rings, considered engraving and a commitment to honest trade. Explore the Wilayah Stone design collection.',icons:{icon:'/favicon.png'},openGraph:{title:'Wilayah Stone',description:'Love and wilayah in every hand.',images:['/assets/brand.png']},alternates:{canonical:"/"},robots:{index:true,follow:true}};}
export default async function Layout({children}:{children:React.ReactNode}){const site=await pageOrigin();return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><OrderingProvider><div id="main-content">{children}</div></OrderingProvider><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"Wilayah Stone",url:site,logo:site+'/assets/logo.png',description:"Men’s ring design collection rooted in wilayah and honest craftsmanship.",telephone:publicContact.phone,sameAs:[publicContact.facebook,publicContact.instagram],contactPoint:{"@type":"ContactPoint",contactType:"orders and customer support",telephone:publicContact.phone,url:site+'/help',availableLanguage:"English"}})}}/></body></html>}
