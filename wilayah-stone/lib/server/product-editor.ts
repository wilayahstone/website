import {z} from 'zod';
import {catalog,stones,type Product} from '../catalog';
import {HttpError,json} from '../http';
import {getRecord,saveCatalogueProduct} from './data';
import {parseProductCommerce} from '../product-commerce';
import {assignVariationSkus,parseVariationSetup} from '../variations';
import {audit,can,type Staff} from './access';
import {parseProductDescription,descriptionText,descriptionImageIds,readProductDescription,DESCRIPTION_TEXT_LIMIT} from '../product-description';
import {productPublicationIssues} from '../product-publication';

const productId=z.string().regex(/^[A-Z0-9][A-Z0-9-]{2,29}$/);
const text=(max:number)=>z.string().max(max).default('');
// Drafts keep the same safety and size limits. Completeness is checked on publication.
const schema=z.object({
 id:productId,sku:z.string().trim().toUpperCase().max(40).default(''),
 name:text(150),stone:z.string().max(60).refine(v=>!v||stones.includes(v)).default(''),engraving:text(100),metal:z.literal('925 sterling silver').default('925 sterling silver'),
 price:z.number().finite().min(0).max(100000000).nullable().default(null),status:z.enum(['Design preview','Unavailable','Ready for review']).default('Design preview'),
 originalPrice:z.number().finite().min(0).max(100000000).nullable().default(null),
 discountedPrice:z.number().finite().min(0).max(100000000).nullable().default(null),
 discountPercent:z.number().finite().min(0).max(100).nullable().default(null),
 soldCount:z.number().int().min(0).max(100000000).default(0),
 availableQuantity:z.number().int().min(0).max(100000000).default(0),
 condition:z.string().trim().max(60).default('New'),
 weight:text(100),dimensions:text(100),origin:text(100),treatment:text(100),description:text(DESCRIPTION_TEXT_LIMIT),supplier:text(200),
 capacity:z.number().int().min(0).max(10000).default(0),deliveryDays:z.number().int().min(0).max(365).default(0),verified:z.boolean().default(false),
 imageIds:z.array(z.string().uuid()).max(8).optional(),published:z.boolean().optional(),
});
function invalidFields(error:z.ZodError){const labels:Record<string,string>={id:'product reference',sku:'SKU',name:'product name',stone:'gemstone',engraving:'engraving / design name',description:'product description',price:'internal price',imageIds:'product images',capacity:'reserved units',deliveryDays:'production days'};const fields=[...new Set(error.issues.map(issue=>labels[String(issue.path[0])]||String(issue.path[0]||'product details')))];return new HttpError(400,'Check the '+fields.join(', ')+'. Your changes are still in the editor.')}

export async function saveProduct(staff:Staff,b:any){
 if(!can(staff.role,'catalog.write'))throw new HttpError(403,'You do not have access to this operation.');
 if(!b.data||typeof b.data!=='object'||Array.isArray(b.data))throw new HttpError(400,'Add the product details before saving.');
 if(b.intent!==undefined&&!['draft','publish','schedule'].includes(b.intent))throw new HttpError(400,'Choose Save as draft or Publish product.');
 let id:string;try{id=productId.parse(b.data.id)}catch{throw new HttpError(400,'This product reference is invalid. Reopen the catalogue editor.')}
 const original=catalog.find(p=>p.id===id),previous=await getRecord(id,'product'),creating=b.create===true;
 if(previous&&previous.owner!=='store')throw new HttpError(409,'This product reference is in use.');
 if(previous?.data.archivedAt)throw new HttpError(409,'Restore this product from the recycle bin before editing.');
 if(creating&&(original||previous)||!creating&&!original&&!previous?.data.custom)throw new HttpError(409,creating?'This product already exists. Reopen it from the catalogue to continue editing.':'Product not found.');
 if(previous&&b.expectedUpdatedAt!==undefined&&b.expectedUpdatedAt!==previous.updated)throw new HttpError(409,'This product changed. Refresh before saving.');
 const candidate={...(previous?.data||original||{}),...b.data,id};
 let rich:ReturnType<typeof parseProductDescription>|null|undefined;
 try{
  if(Object.hasOwn(b.data,'descriptionRichText'))rich=b.data.descriptionRichText==null?null:parseProductDescription(b.data.descriptionRichText);
  else if(b.data.description===undefined||b.data.description===(previous?.data.description??original?.description))rich=readProductDescription(candidate.descriptionRichText)||undefined;
  if(rich)candidate.description=descriptionText(rich);
 }catch(e){throw new HttpError(400,e instanceof Error?e.message:'Choose supported description formatting.')}
 let data:z.infer<typeof schema>;try{data=schema.parse(candidate)}catch(e){if(e instanceof z.ZodError)throw invalidFields(e);throw e}
 if(original&&(data.stone!==original.stone||data.engraving.replace(/ \(AS\)$/,'')!==original.engraving.replace(/ \(AS\)$/,'')))throw new HttpError(400,'Keep the original design’s stone and engraving. Create a new product for a different design.');
 if(data.price!==null&&Math.abs(data.price*100-Math.round(data.price*100))>1e-6)throw new HttpError(400,'Use no more than two decimal places for PKR prices.');
 const custom=!original,published=b.intent==='draft'?false:['publish','schedule'].includes(b.intent)?true:data.published??previous?.data.published??!custom;
 const images=data.imageIds||previous?.data.imageIds||[],sku=data.sku||previous?.data.sku||id;
 let setup;try{setup=assignVariationSkus(parseVariationSetup(candidate),sku)}catch(error){throw new HttpError(400,error instanceof z.ZodError?'Check variation option names, values, SKUs and prices.':error instanceof Error?error.message:'Check the product variations.')}
 let commerce;try{commerce=parseProductCommerce(candidate)}catch(error){throw new HttpError(400,error instanceof z.ZodError?'Check attributes, the publication time and quantity discount tiers.':error instanceof Error?error.message:'Check product settings.')}if(b.intent==='schedule'&&(!commerce.publishAt||Date.parse(commerce.publishAt)<=Date.now()))throw new HttpError(400,'Choose a future date and time for this listing.');if(b.intent==='publish'||b.intent==='draft')commerce.publishAt=null;
 const saved:Product={...data,sku,custom,published,imageIds:images,...setup,...commerce,...(rich!==undefined?{descriptionRichText:rich}:{})};
 const allSkus=[sku,...setup.variations.map(variation=>variation.sku)];if(new Set(allSkus).size!==allSkus.length)throw new HttpError(409,'Use a different SKU for the product and each variation.');if(allSkus.some((code,index)=>catalog.some(product=>product.id===code&&(product.id!==id||index>0))))throw new HttpError(409,'This SKU belongs to another catalogue product.');if(new TextEncoder().encode(JSON.stringify(saved)).length>220000)throw new HttpError(400,'This product has too much content. Shorten its description or reduce its variation combinations.');
 if(published){const issues=productPublicationIssues(saved);if(issues.length)throw new HttpError(400,issues.join(' '))}
 for(const imageId of images){const media=await getRecord(imageId,'upload');if(media?.owner!=='store'||media.data.purpose!=='product-image')throw new HttpError(400,'Choose product images uploaded in the catalogue editor.')}
 for(const imageId of descriptionImageIds(rich)){const media=await getRecord(imageId,'upload');if(media?.owner!=='store'||!['product-image','product-description'].includes(media.data.purpose))throw new HttpError(400,'Choose description images uploaded in the catalogue editor.')}
 const result=await saveCatalogueProduct(previous,saved);if(!result.ok)throw new HttpError(409,result.reason==='sku'?'This SKU belongs to another product or variation.':'This product changed. Refresh before saving.');
 await audit(staff,creating?'product.created':'product.updated',id,{sku,published});return json({ok:true,id,published});
}
