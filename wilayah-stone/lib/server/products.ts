import {listingIsPublic,parseProductCommerce} from '../product-commerce';
import {catalog,Product} from '../catalog';
import {parseVariationSetup,activeVariations,hasVariations} from '../variations';
import {readProductDescription} from '../product-description';
import {imamName,respectfulText} from '../imams';
import {listRecords,getRecord} from './data';
export async function productRecords(){const rows=[];for(let offset=0;offset<5000;offset+=500){const page=await listRecords('product',undefined,500,offset);rows.push(...page);if(page.length<500)return rows}throw Error('Catalogue record limit reached')}
export async function productExists(id:string){const row=await getRecord(id,'product');return listingIsPublic(row?.data||{})&&(!!catalog.find(p=>p.id===id)||row?.owner==='store'&&row.data.custom===true)}
export async function getProducts(includeInternal=false):Promise<Product[]>{
 const rows=await productRecords(),overrides=new Map(rows.map(r=>[r.id,r])),baseIds=new Set(catalog.map(p=>p.id));
 const items=[...catalog,...rows.filter(r=>r.owner==='store'&&r.data.custom===true&&!baseIds.has(r.id)).map(r=>({...r.data,id:r.id}) as Product)];
 return items.filter(p=>!overrides.get(p.id)?.data.archivedAt&&(includeInternal||listingIsPublic(overrides.get(p.id)?.data||{}))).map(p=>{
  const row=overrides.get(p.id),merged={...p,...row?.data,id:p.id,sku:row?.data.sku||p.sku||p.id,updated:row?.updated||null};merged.descriptionRichText=readProductDescription(merged.descriptionRichText);merged.engraving=imamName(merged.engraving);merged.name=respectfulText(merged.name);merged.description=respectfulText(merged.description);
  let setup;try{setup=parseVariationSetup(merged)}catch{setup={variationOptions:[],variations:[],showVariationPrices:false};if(!includeInternal)merged.status='Unavailable'}Object.assign(merged,setup);try{Object.assign(merged,parseProductCommerce(merged))}catch{merged.attributes=[];merged.quantityDiscounts=[];merged.volumePricingEnabled=false;if(!includeInternal)merged.status='Unavailable'}
  if(includeInternal)return merged;
  const variations=activeVariations(merged);if(hasVariations(merged)&&!variations.length)merged.status='Unavailable';
  const unknown=(s:string)=>!s||/awaiting|not yet verified/i.test(s);return {...merged,variations:variations.map(variation=>({...variation,price:merged.showVariationPrices?(variation.price??merged.price):null})),price:merged.showVariationPrices&&hasVariations(merged)?merged.price:null,status:merged.status==='Unavailable'?'Unavailable':'Made to order',supplier:'',capacity:0,weight:unknown(merged.weight)?'Agreed in your written quotation':merged.weight,dimensions:unknown(merged.dimensions)?'Agreed in your written quotation':merged.dimensions,origin:unknown(merged.origin)?'Details in your ring specification':merged.origin,treatment:unknown(merged.treatment)?'Disclosed with your selected stone':merged.treatment};
 });
}
