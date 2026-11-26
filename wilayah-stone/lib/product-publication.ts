import {variationIssues} from './variations';
import {stones,type Product} from './catalog';
/** Publication requirements are shared by the admin form and the server. Drafts may be incomplete. */
export function productPublicationIssues(product:Product):string[]{
 const errors:string[]=[];
 if(product.name.trim().length<2)errors.push('Add a product name with at least two characters.');
 if(!stones.includes(product.stone))errors.push('Choose a gemstone.');
 if(!product.engraving.trim())errors.push('Add an engraving or design name.');
 if(product.description.trim().length<20)errors.push('Add a product description with at least 20 characters.');
 if(product.sku&&!/^[A-Z0-9][A-Z0-9_-]{1,39}$/i.test(product.sku))errors.push('Use a SKU of 2–40 letters, numbers, hyphens or underscores.');
 if(product.custom&&(product.imageIds?.length!==2||new Set(product.imageIds).size!==2))errors.push('Add both the main and detail product images.');
 if(product.price!==null&&(!Number.isFinite(product.price)||product.price<1))errors.push('Enter an internal price above zero, or leave it blank.');
 if(product.verified&&[product.weight,product.dimensions,product.origin,product.treatment].some(v=>!v.trim()||/awaiting|not yet|pending/i.test(v)))errors.push('Add measured specifications, origin and treatment disclosure before completing review.');
 if(product.attributes?.some(attribute=>!attribute.name.trim()||!attribute.values.length))errors.push('Complete the product attribute names and values.');
 errors.push(...variationIssues({variationOptions:product.variationOptions||[],variations:product.variations||[],showVariationPrices:product.showVariationPrices||false}));return errors;
}
