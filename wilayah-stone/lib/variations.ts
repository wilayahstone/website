import {z} from 'zod';
import type {Product} from './catalog';
import {quoteMoney} from './payments';
export const MAX_VARIATION_OPTIONS=6,MAX_VARIATIONS=200;
export type VariationOption={id:string;name:string;values:string[]};
export type ProductVariation={id:string;options:Record<string,string>;sku:string;price:number|null;enabled:boolean};
export type VariationSetup={variationOptions:VariationOption[];variations:ProductVariation[];showVariationPrices:boolean};
export type SelectionItem={productId:string;variationId?:string;variationVersion?:string;size:string;engraving:string};
const key=(value:string)=>value.normalize('NFKC').trim().toLowerCase();
const schema=z.object({variationOptions:z.array(z.object({id:z.string().uuid(),name:z.string().trim().max(60),values:z.array(z.string().trim().min(1).max(60)).max(30)})).max(MAX_VARIATION_OPTIONS).default([]),variations:z.array(z.object({id:z.string().uuid(),options:z.record(z.string().max(60)),sku:z.string().trim().toUpperCase().max(40).default(''),price:z.number().finite().positive().max(100000000).nullable().default(null),enabled:z.boolean().default(true)})).max(MAX_VARIATIONS).default([]),showVariationPrices:z.boolean().default(false)});
export function combinationKey(options:Record<string,string>,groups:VariationOption[]){return JSON.stringify(groups.map(group=>[group.id,key(options[group.id]||'')]))}
export function completeVariation(variation:ProductVariation,groups:VariationOption[]){return groups.length>0&&Object.keys(variation.options).length===groups.length&&groups.every(group=>!!group.name&&group.values.includes(variation.options[group.id]))}
export function variationIssues(setup:VariationSetup):string[]{
 const issues:string[]=[];if(!setup.variationOptions.length&&!setup.variations.length)return issues;
 if(!setup.variationOptions.length)issues.push('Add an option such as colour or size for your variations.');
 if(setup.variationOptions.some(group=>!group.name||!group.values.length))issues.push('Give each variation option a name and at least one value.');
 if(!setup.variations.some(variation=>variation.enabled&&completeVariation(variation,setup.variationOptions)))issues.push('Add at least one available, complete variation.');
 if(setup.variations.some(variation=>variation.enabled&&!completeVariation(variation,setup.variationOptions)))issues.push('Choose a value for every option in each available variation.');
 return issues;
}
export function parseVariationSetup(input:unknown):VariationSetup{
 const parsed=schema.parse(input||{}),names=new Set<string>(),ids=new Set<string>(),skus=new Set<string>(),combinations=new Set<string>();
 for(const group of parsed.variationOptions){if(ids.has(group.id))throw Error('Variation option references must be unique.');ids.add(group.id);if(group.name){const name=key(group.name);if(names.has(name))throw Error('Use a different name for each variation option.');names.add(name)}if(['size','ring size','ring size (us)'].includes(key(group.name))&&group.values.some(value=>value.length>30))throw Error('Use up to 30 characters for ring size values.');if(new Set(group.values.map(key)).size!==group.values.length)throw Error('Remove repeated values from '+(group.name||'this option')+'.')}
 ids.clear();for(const variation of parsed.variations){if(Object.keys(variation.options).length>MAX_VARIATION_OPTIONS)throw Error('Use only the configured variation options.');if(ids.has(variation.id))throw Error('Each variation needs its own reference.');ids.add(variation.id);if(variation.price!==null&&Math.abs(variation.price*100-Math.round(variation.price*100))>1e-6)throw Error('Use no more than two decimal places for variation prices.');if(variation.sku){if(!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(variation.sku))throw Error('Use 2–40 letters, numbers, hyphens or underscores in variation SKUs.');if(skus.has(variation.sku))throw Error('Each variation needs a unique SKU.');skus.add(variation.sku)}if(completeVariation(variation,parsed.variationOptions)){const combo=combinationKey(variation.options,parsed.variationOptions);if(combinations.has(combo))throw Error('This combination already has a variation.');combinations.add(combo)}}
 return parsed;
}
export function assignVariationSkus(setup:VariationSetup,baseSku:string):VariationSetup{return {...setup,variations:setup.variations.map(variation=>({...variation,sku:variation.sku||baseSku.slice(0,27)+'-'+variation.id.replace(/-/g,'').slice(0,12).toUpperCase()}))}}
export function hasVariations(product:Pick<Product,'variationOptions'|'variations'>){return !!product.variationOptions?.length||!!product.variations?.length}
export function activeVariations(product:Pick<Product,'variationOptions'|'variations'>){return (product.variations||[]).filter(variation=>variation.enabled&&completeVariation(variation,product.variationOptions||[]))}
export function findVariation(product:Pick<Product,'variations'>,id?:string){return id?product.variations?.find(variation=>variation.id===id):undefined}
export function variationLabel(product:Pick<Product,'variationOptions'>,variation?:ProductVariation){return variation?(product.variationOptions||[]).map(group=>group.name+': '+(variation.options[group.id]||'')).join(' · '):''}
export function variationOptionValue(product:Pick<Product,'variationOptions'>,variation:ProductVariation|undefined,names:string[]){const group=product.variationOptions?.find(option=>names.map(key).includes(key(option.name)));return group&&variation?variation.options[group.id]||'':''}
export function selectionIssue(product:Product,item:Pick<SelectionItem,'variationId'|'variationVersion'|'size'>){
 const variation=findVariation(product,item.variationId);if(hasVariations(product)&&(!variation||!variation.enabled||!completeVariation(variation,product.variationOptions||[])))return 'Choose an available combination for '+product.name+'.';
 if(item.variationId&&!variation)return 'This variation is no longer available. Choose your options again.';
 if(variation&&item.variationVersion&&product.updated&&item.variationVersion!==product.updated)return 'These options have changed. Choose your combination again.';
 const size=variationOptionValue(product,variation,['Size','Ring size','Ring size (US)']);if(size&&key(size)!==key(item.size))return 'The ring size must match the selected variation.';return '';
}
export function variationPrice(product:Product,variation?:ProductVariation){return variation?.price??product.price}
export function variationPriceLabel(product:Product,variation?:ProductVariation){const price=variationPrice(product,variation);return product.showVariationPrices&&price!==null?quoteMoney(Math.round(price*100),'PKR'):'Personal quotation'}
export function variationSnapshot(product:Product,item:SelectionItem){const variation=findVariation(product,item.variationId);return {productId:product.id,name:product.name,sku:variation?.sku||product.sku||product.id,...(variation?{variationId:variation.id,options:(product.variationOptions||[]).map(group=>({name:group.name,value:variation.options[group.id]}))}:{}),size:item.size,engraving:item.engraving}}
export function variationProduct(product:Product,item:SelectionItem):Product{const variation=findVariation(product,item.variationId);return {...product,price:variationPrice(product,variation),sku:variation?.sku||product.sku,metal:variationOptionValue(product,variation,['Material','Metal'])||product.metal}}
export function generateVariations(groups:VariationOption[],existing:ProductVariation[]):ProductVariation[]{
 if(!groups.length||groups.some(group=>!group.name.trim()||!group.values.length))throw Error('Add names and values to the options first.');
 const total=groups.reduce((count,group)=>count*group.values.length,1);if(total>MAX_VARIATIONS)throw Error('This creates '+total+' combinations. Use fewer values or add the combinations you offer individually.');
 let combinations:Record<string,string>[]=[{}];for(const group of groups)combinations=combinations.flatMap(combination=>group.values.map(value=>({...combination,[group.id]:value})));
 const keys=new Set(existing.map(variation=>combinationKey(variation.options,groups))),missing=combinations.filter(combination=>!keys.has(combinationKey(combination,groups)));
 if(existing.length+missing.length>MAX_VARIATIONS)throw Error('Use up to '+MAX_VARIATIONS+' variations for one product.');
 return [...existing,...missing.map(options=>({id:crypto.randomUUID(),options,sku:'',price:null,enabled:true}))];
}

export function productMaterialDescription(product:Product){const option=product.variationOptions?.find(option=>['material','metal'].includes(key(option.name)));return option?.values.length?option.values.join(' / '):product.metal}

export function productPriceLabel(product:Product){if(!product.showVariationPrices||!hasVariations(product))return 'Personal quotation';const prices=activeVariations(product).map(variation=>variationPrice(product,variation));if(!prices.length||prices.some(price=>price===null))return 'Choose options for a quotation';const values=prices as number[],low=Math.min(...values),high=Math.max(...values);return low===high?quoteMoney(Math.round(low*100),'PKR'):'From '+quoteMoney(Math.round(low*100),'PKR')}
