'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ChevronLeft,ChevronRight,Minus,Plus,X,ZoomIn} from 'lucide-react';
import type {Product} from '../../lib/catalog';
import {productGallery} from '../../lib/product-imagery';
import {ProductImage} from './product-image';

export function ProductGallery({product,priority=false}:{product:Product;priority?:boolean}){
 const [view,setView]=useState<0|1>(0),[zoom,setZoom]=useState(false),[scale,setScale]=useState(1);
 const dialog=useRef<HTMLElement>(null),touch=useRef<{x:number;y:number}|null>(null),trigger=useRef<HTMLButtonElement>(null);
 const viewport=useRef<HTMLDivElement>(null);
 const titleId=useId(),images=productGallery(product),labels=['Front view','Detail view'];
 useEffect(()=>{if(zoom&&viewport.current){const box=viewport.current;box.scrollLeft=(box.scrollWidth-box.clientWidth)/2;box.scrollTop=(box.scrollHeight-box.clientHeight)/2}},[scale,zoom,view]);
 function choose(index:0|1){setView(index);setScale(1)}
 function toggle(){setView(v=>v===0?1:0);setScale(1)}
 useEffect(()=>{setView(0);setScale(1);setZoom(false)},[product.id]);
 useEffect(()=>{
  if(!zoom)return;
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setZoom(false);return}
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopImmediatePropagation();toggle();return}
   if(event.key==='Tab'){
    event.stopImmediatePropagation();const nodes=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')||[]),first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
   }
  };
  document.addEventListener('keydown',key,true);
  return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);(previous?.isConnected?previous:trigger.current)?.focus()};
 },[zoom]);
 return <div className="product-gallery" aria-label={`${product.name} image gallery`}>
  <div className="gallery-stage" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)toggle()}}>
   <button ref={trigger} className="gallery-open" aria-label={`Zoom ${labels[view].toLowerCase()} of ${product.name}`} onClick={()=>{setScale(1);setZoom(true)}}><ProductImage product={product} view={view} large priority={priority}/><span className="gallery-zoom-label"><ZoomIn size={17}/>Zoom</span></button>
   <button className="gallery-arrow gallery-previous" aria-label="Previous ring image" onClick={toggle}><ChevronLeft size={19}/></button><button className="gallery-arrow gallery-next" aria-label="Next ring image" onClick={toggle}><ChevronRight size={19}/></button>
  </div>
  <div className="gallery-thumbnails" role="group" aria-label="Choose a ring image">{images.map((image,index)=><button key={image.src} aria-label={`Show ${labels[index].toLowerCase()}`} aria-pressed={view===index} onClick={()=>choose(index as 0|1)}><img src={image.src.replace('-960.webp','-480.webp')} width={64} height={64} alt="" loading="lazy"/><span>{labels[index]}</span></button>)}<span className="gallery-count" aria-live="polite">0{view+1} / 02</span></div>
  {zoom&&createPortal(<div className="gallery-lightbox" onClick={()=>setZoom(false)}><section ref={dialog} className="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={e=>e.stopPropagation()}><header><div><span id={titleId}>{product.name}</span><small>{labels[view]}</small></div><button className="gallery-close" aria-label="Close image zoom" onClick={()=>setZoom(false)}><X size={22}/></button></header><div ref={viewport} className="gallery-zoom-viewport" tabIndex={-1}><div className="gallery-zoom-canvas" style={{width:`${scale*100}%`,height:`${scale*100}%`}}><img draggable={false} src={images[view].src} alt={images[view].alt} width={960} height={960}/></div></div><div className="gallery-zoom-controls"><button aria-label="Previous zoomed ring image" onClick={toggle}><ChevronLeft size={19}/></button><span>{labels[view]}</span><button aria-label="Next zoomed ring image" onClick={toggle}><ChevronRight size={19}/></button><div className="gallery-scale-controls"><button aria-label="Zoom out" disabled={scale<=1} onClick={()=>setScale(s=>Math.max(1,s-.5))}><Minus size={18}/></button><output aria-live="polite">{Math.round(scale*100)}%</output><button aria-label="Zoom in" disabled={scale>=2.5} onClick={()=>setScale(s=>Math.min(2.5,s+.5))}><Plus size={18}/></button></div></div></section></div>,document.body)}
 </div>;
}
