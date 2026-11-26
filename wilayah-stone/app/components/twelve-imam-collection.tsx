'use client';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {imams,type Product} from '../../lib/catalog';
import {GemstoneImage} from './gemstone-image';
const families=['Aqeeq','Firoza','Dur-e-Najaf','Hadeed-e-Chini'];
export function TwelveImamCollection({products,onChoose}:{products:Product[];onChoose:(p:Product)=>void}){
 const[name,setName]=useState(imams[0]);
 return <section className="section imam-collection"><div className="section-heading"><div className="eyebrow">FOUR STONES. TWELVE SACRED NAMES.</div><h2>The Twelve-Imam Collection.</h2><p>A name held close. A stone chosen by you.</p></div><div className="imam-name-picker"><label htmlFor="imam-name">Choose your Imam-name design</label><select id="imam-name" value={name} onChange={e=>setName(e.target.value)}>{imams.map(n=><option key={n} value={n}>{n}</option>)}</select><span>Explore {name} across four stone families.</span></div><div className="stone-categories imam-stones">{families.map(stone=>{const product=products.find(p=>p.stone===stone&&p.engraving===name);return <button className="gemstone-card" key={stone} onClick={()=>product&&onChoose(product)} disabled={!product} aria-label={`Explore ${stone} with ${name}`}><GemstoneImage stone={stone}/><div className="imam-stone-copy"><small>THE TWELVE-IMAM COLLECTION</small><h3>{stone}</h3><span>{name}<ArrowUpRight size={16}/></span></div></button>})}</div><a className="text-link collection-all" href="/collection">Explore every stone and design <ArrowUpRight size={16}/></a></section>
}
