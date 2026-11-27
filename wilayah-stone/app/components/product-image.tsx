'use client';
import {useEffect,useRef,useState} from 'react';
import type {Product} from '../../lib/catalog';
import {productImage} from '../../lib/product-imagery';
import {ZoomIn} from 'lucide-react';

export function ProductImage({product,large=false,priority=false,className='',view=0,hoverSwap=false}:{product:Pick<Product,'id'|'stone'|'engraving'|'imageIds'>;large?:boolean;priority?:boolean;className?:string;view?:number;hoverSwap?:boolean}){
 const image=productImage(product,view),second=productImage(product,1);
 const secondary=useRef<HTMLImageElement>(null),[secondaryReady,setSecondaryReady]=useState(false);
 useEffect(()=>{setSecondaryReady((secondary.current?.naturalWidth||0)>1)},[product.id,hoverSwap]);
 const sizes=large?'(max-width: 720px) 100vw, 50vw':'(max-width: 480px) 46vw, (max-width: 960px) 45vw, 25vw';
 return <div className={`ring-product-image${large?' ring-product-image-large':''}${hoverSwap?' ring-image-swap':''}${secondaryReady?' secondary-ready':''}${className?' '+className:''}`}><img className="ring-image-primary" src={image.src} srcSet={image.srcSet} sizes={sizes} alt={image.alt} width={960} height={960} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async"/>{hoverSwap&&<><picture className="ring-image-secondary" aria-hidden="true"><source media="(hover: hover) and (pointer: fine)" srcSet={second.srcSet} sizes={sizes}/><img ref={secondary} onLoad={e=>setSecondaryReady(e.currentTarget.naturalWidth>1)} src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width={960} height={960} loading="lazy" decoding="async"/></picture><span className="ring-view-hint" aria-hidden="true"><ZoomIn size={15}/>View ring</span></>}</div>;
}
