'use client';
import {useEffect,useState} from 'react';
import type {Product} from '../../lib/catalog';
import {activeVariations,findVariation,variationLabel} from '../../lib/variations';
export function VariationSelector({product,value,onChange,disabled=false}:{product:Product;value?:string;onChange:(id:string)=>void;disabled?:boolean}){
 const selected=findVariation(product,value),[choices,setChoices]=useState<Record<string,string>>(()=>selected?.options||{}),rows=activeVariations(product);
 useEffect(()=>{setChoices(findVariation(product,value)?.options||{})},[product.id]);
 useEffect(()=>{const selected=findVariation(product,value);if(selected)setChoices(selected.options)},[product.id,value]);
 if(!product.variationOptions?.length)return null;
 function choose(id:string,value:string){const next={...choices,[id]:value};setChoices(next);const match=rows.find(variation=>product.variationOptions!.every(option=>variation.options[option.id]===next[option.id]));onChange(match?.id||'')}
 return <div className="store-variation-selector"><div className="form-grid">{product.variationOptions.map(option=><label key={option.id}>{option.name}<select value={choices[option.id]||''} disabled={disabled} onChange={event=>choose(option.id,event.target.value)}><option value="">Choose {option.name.toLowerCase()}</option>{option.values.map(entry=><option key={entry} value={entry} disabled={!rows.some(variation=>variation.options[option.id]===entry&&product.variationOptions!.every(other=>other.id===option.id||!choices[other.id]||variation.options[other.id]===choices[other.id]))}>{entry}</option>)}</select></label>)}</div>{selected&&<div className="selected-variation" role="status"><span>{variationLabel(product,selected)}</span><span>SKU {selected.sku}</span></div>}{Object.values(choices).some(Boolean)&&<button type="button" className="text-link clear-variation" disabled={disabled} onClick={()=>{setChoices({});onChange('')}}>Clear options</button>}{!rows.length&&<p role="status">These options are currently unavailable.</p>}</div>;
}
