import {findVariation,hasVariations,selectionIssue,variationLabel,variationOptionValue} from './variations';
import {imamName} from './imams';
import {z} from 'zod';
import {imams,stones,type Product} from './catalog';

export const personalisationKey='ws-personalisation-v1';
export const ringSizes=['6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','Need sizing help'];
export const personalisationSteps=['Your stone','Your engraving','Your fit','Your brief'];
export const draftSchema=z.object({version:z.literal(1),productId:z.string().max(30).optional(),variationId:z.string().uuid().optional(),variationVersion:z.string().max(100).optional(),stone:z.string().max(50),mode:z.enum(['imams','plain','custom']),imam:z.string().max(100),custom:z.string().max(300),size:z.string().max(30),sizeNotes:z.string().max(500),notes:z.string().max(1600),step:z.number().int().min(0).max(3)});
export type RingDraft=z.infer<typeof draftSchema>;
export function availableProducts(products:Product[],stone?:string){return products.filter(p=>p.status!=='Unavailable'&&(!stone||p.stone===stone));}
export function draftForProduct(product?:Product,variationId?:string):RingDraft{const variation=product?findVariation(product,variationId):undefined;return {...(variation?{variationId:variation.id,variationVersion:product?.updated||undefined}:{}),version:1,productId:product?.id,stone:product?.stone||'',mode:product?.engraving==='Plain'?'plain':product&&!imams.includes(product.engraving)?'custom':'imams',imam:product&&imams.includes(product.engraving)?product.engraving:imams[0],custom:product&&!imams.includes(product.engraving)&&product.engraving!=='Plain'?product.engraving:'',size:product?variationOptionValue(product,variation,['Size','Ring size','Ring size (US)']):'',sizeNotes:'',notes:'',step:0};}
export function selectedProduct(products:Product[],draft:RingDraft){const items=availableProducts(products,draft.stone);if(!draft.stone)return undefined;if(draft.productId)return items.find(p=>p.id===draft.productId&&(draft.mode!=='imams'||p.engraving===draft.imam));return draft.mode==='imams'?items.find(p=>p.engraving===draft.imam):items.find(p=>p.engraving==='Plain')||items[0];}
export function engravingText(draft:RingDraft){return draft.mode==='imams'?draft.imam:draft.mode==='plain'?'Plain stone':draft.custom.trim()||'Custom artwork';}
export function stepIssue(step:number,draft:RingDraft,products:Product[],hasReference=false){
 const product=selectedProduct(products,draft),variation=product?findVariation(product,draft.variationId):undefined,size=product?variationOptionValue(product,variation,['Size','Ring size','Ring size (US)']):'';
 if(step===0&&product&&hasVariations(product)){const issue=selectionIssue(product,{variationId:draft.variationId,variationVersion:draft.variationVersion,size:size||draft.size});if(issue)return issue;}

 if(step===0&&draft.productId&&!selectedProduct(products,draft))return 'Choose an available design to begin your ring.';
 if(step===0&&!availableProducts(products,draft.stone).length||step===0&&!stones.includes(draft.stone))return 'Choose a stone to begin your ring.';
 if(step===1){if(draft.mode==='imams'&&(!imams.includes(draft.imam)||!selectedProduct(products,draft)))return 'Choose a name available for this stone, or share your own design.';if(draft.mode==='custom'&&!draft.custom.trim()&&!hasReference)return 'Add your engraving text or a design image.';}
 if(step===2&&size&&draft.size!==size)return 'Choose the size in your selected product options.';
 if(step===2&&!size&&!ringSizes.includes(draft.size))return 'Choose your ring size, or select sizing help.';
 return '';
}
export function restoreRingDraft(raw:string,products:Product[]):RingDraft|null{try{const draft=draftSchema.parse(JSON.parse(raw));draft.imam=imamName(draft.imam);if(draft.stone&&!stones.includes(draft.stone))return null;if(draft.size&&!ringSizes.includes(draft.size)&&!draft.variationId)return null;for(let step=0;step<draft.step;step++)if(stepIssue(step,draft,products,false)){draft.step=step;break}return draft;}catch{return null;}}
export function ringBrief(draft:RingDraft,referenceName='',product?:Product){
 const variation=product?findVariation(product,draft.variationId):undefined,material=product?variationOptionValue(product,variation,['Material','Metal'])||product.metal:'925 sterling silver';
 return ['Personalisation request · '+material,...(product&&variation?['Product options: '+variationLabel(product,variation),'Variation SKU: '+variation.sku]:[]),`Stone: ${draft.stone}`,`Engraving: ${engravingText(draft)}`,`Ring size: ${draft.size==='Need sizing help'?'Sizing help requested':(product&&variationOptionValue(product,variation,['Size','Ring size','Ring size (US)'])?'':'US ')+draft.size}`,draft.sizeNotes.trim()&&'Sizing notes: '+draft.sizeNotes.trim(),draft.notes.trim()&&'Design notes: '+draft.notes.trim(),referenceName&&'Design image: '+referenceName,draft.mode==='custom'&&'Catalogue image is a setting reference. Personal artwork to be agreed with the atelier.'].filter(Boolean).join('\n');
}
export function personalisationMessage(draft:RingDraft,product:Product,referenceName=''){
 return ['Salaam, I would like to personalise a Wilayah Stone ring.',`Catalogue reference: ${product.name} (${product.sku||product.id})`,ringBrief(draft,referenceName,product),referenceName&&'I will attach my design image in this WhatsApp conversation.','Please share the selected stone details, final engraving proof, full quotation and delivery-by date before I place my order.'].filter(Boolean).join('\n');
}
