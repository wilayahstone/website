import {pageOrigin} from '../../../lib/server/page-origin';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import Store from '../../store';
import {getProducts} from '../../../lib/server/products';
import {productGallery} from '../../../lib/product-imagery';

export const dynamic='force-dynamic';
const readProducts=cache(()=>getProducts());


export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 const product=(await readProducts()).find(p=>p.id===id);
 const title=product?`${product.name} | Wilayah Stone`:'Product not found';
 const description=product?.description.slice(0,160);
 const images=product?productGallery(product):[];
 return {
  title,description,alternates:{canonical:`/product/${id}`},robots:{index:!!product,follow:true},
  openGraph:{title,description,url:`/product/${id}`,images:images.map(image=>({url:image.src,width:960,height:960,alt:image.alt}))},
  twitter:{card:'summary_large_image',title,description,images:images.map(image=>image.src)},
 };
}

export default async function Product({params}:{params:Promise<{id:string}>}){
 const base=await pageOrigin(),{id}=await params;
 const products=await readProducts(),product=products.find(p=>p.id===id);
 if(!product)notFound();
 const images=productGallery(product);
 const structured={'@context':'https://schema.org','@graph':[
  {'@type':'Product',name:product.name+' ring',sku:product.sku||product.id,description:product.description,category:'Men’s rings',brand:{'@type':'Brand',name:'Wilayah Stone'},image:images.map(image=>base+image.src),url:base+'/product/'+product.id},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'The collection',item:base+'/collection'},{'@type':'ListItem',position:2,name:product.name,item:base+'/product/'+product.id}]},
 ]};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/><Store initialPage="product" initialProductId={id} initialProducts={products}/></>;
}
