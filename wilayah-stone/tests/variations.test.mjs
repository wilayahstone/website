import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
const require=createRequire(import.meta.url),modules=new Map();
function moduleURL(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;js=js.replace(/from\s+(['"])([^'"]+)\1(?=;)/g,(_,q,s)=>s.startsWith('.')?`from '${moduleURL(path.resolve(path.dirname(file),s+'.ts'))}'`:`from '${pathToFileURL(require.resolve(s)).href}'`);const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');modules.set(file,url);return url}
const V=await import(moduleURL('lib/variations.ts'));
const {catalog}=await import(moduleURL('lib/catalog.ts'));
const {draftForProduct,stepIssue,restoreRingDraft,ringBrief}=await import(moduleURL('lib/personalisation.ts'));
const {selectionMessage}=await import(moduleURL('lib/ordering.ts'));
const group=(name,values)=>({id:crypto.randomUUID(),name,values});
function fixture(){const variationOptions=[group('Colour',['Green','Black']),group('Size',['9','10']),group('Material',['925 sterling silver'])];const setup=V.assignVariationSkus(V.parseVariationSetup({variationOptions,variations:V.generateVariations(variationOptions,[])}),'RING-ONE');return {...catalog[0],...setup,updated:'2026-11-25T10:00:00Z'}}

test('combination generation preserves existing identities, prices and SKUs and adds only missing combinations',()=>{
 const product=fixture();assert.equal(product.variations.length,4);const first={...product.variations[0],sku:'CUSTOM-ONE',price:1234.56,enabled:false};const rows=V.generateVariations(product.variationOptions,[first]);assert.equal(rows.length,4);assert.deepEqual(rows[0],first);assert.deepEqual(V.generateVariations(product.variationOptions,rows),rows);
 const expanded=product.variationOptions.map((o,i)=>i?o:{...o,values:[...o.values,'Blue']});assert.equal(V.generateVariations(expanded,rows).length,6);assert.equal(new Set(product.variations.map(v=>v.sku)).size,4);assert.ok(product.variations.every(v=>v.sku.length<=40));
});
test('invalid duplicated options, values, combinations, SKUs and fractional cents cannot be saved',()=>{
 const p=fixture(),row=p.variations[0];for(const data of [ {...p,variationOptions:[...p.variationOptions,group('colour',['Red'])]}, {...p,variationOptions:[group('Colour',['Green',' green '])]}, {...p,variations:[row,{...row,id:crypto.randomUUID(),sku:'OTHER'}]}, {...p,variations:[row,{...p.variations[1],sku:row.sku.toLowerCase()}]}, {...p,variations:[{...row,price:1.001}]}, {...p,variations:[{...row,sku:'bad sku'}]} ])assert.throws(()=>V.parseVariationSetup(data));
});
test('draft variations can be incomplete but publishing requires a complete available combination',()=>{
 const partial=V.parseVariationSetup({variationOptions:[group('',[])],variations:[{id:crypto.randomUUID(),options:{}}]});assert.ok(V.variationIssues(partial).length);assert.equal(partial.variations[0].price,null);assert.equal(partial.showVariationPrices,false);const p=fixture();assert.deepEqual(V.variationIssues(p),[]);assert.ok(V.variationIssues({...p,variations:p.variations.map(v=>({...v,enabled:false}))}).length);
});
test('ring-size attributes stay within the accepted ordering field length',()=>{assert.throws(()=>V.parseVariationSetup({variationOptions:[group('Size',['x'.repeat(31)])]}),/30 characters/);assert.doesNotThrow(()=>V.parseVariationSetup({variationOptions:[group('Style',['x'.repeat(60)])]}))});

test('large generated catalogues fail explicitly rather than dropping combinations',()=>{
 assert.throws(()=>V.generateVariations([group('A',Array.from({length:15},(_,i)=>String(i))),group('B',Array.from({length:15},(_,i)=>String(i)))],[]),/225 combinations/);assert.throws(()=>V.generateVariations([group('Empty',[])],[]),/names and values/);
});
test('selection validation rejects unknown, disabled, changed and mismatched-size options',()=>{
 const p=fixture(),row=p.variations[0],item={variationId:row.id,variationVersion:p.updated,size:'9'};assert.equal(V.selectionIssue(p,item),'');assert.match(V.selectionIssue(p,{...item,size:'10'}),/size must match/);assert.match(V.selectionIssue(p,{...item,variationVersion:'old'}),/changed/);assert.match(V.selectionIssue(p,{...item,variationId:crypto.randomUUID()}),/available combination/);assert.match(V.selectionIssue({...p,variations:[{...row,enabled:false}]},item),/available combination/);
});
test('variation prices inherit the base price, allow a quotation and require deliberate public display',()=>{
 const p=fixture(),row={...p.variations[0],price:1500.25};assert.equal(V.variationPrice({...p,price:1200},row),1500.25);assert.equal(V.variationPrice({...p,price:1200},{...row,price:null}),1200);assert.equal(V.variationPriceLabel(p,row),'Personal quotation');assert.match(V.variationPriceLabel({...p,showVariationPrices:true},row),/1,500\.25/);assert.equal(V.productPriceLabel({...p,showVariationPrices:true}),'Choose options for a quotation');assert.match(V.productPriceLabel({...p,showVariationPrices:true,price:1200}),/1,200/);
});
test('WhatsApp and personalisation retain the canonical SKU and exact selected attributes and engraving',()=>{
 const p=fixture(),row=p.variations[0],draft={...draftForProduct(p,row.id),size:'9',step:3,mode:'custom',custom:'يا علي'};assert.equal(stepIssue(0,draft,[p]),'');assert.equal(stepIssue(2,draft,[p]),'');assert.equal(restoreRingDraft(JSON.stringify(draft),[p]).variationId,row.id);assert.match(ringBrief(draft,'',p),new RegExp(row.sku));assert.match(ringBrief(draft,'',p),/يا علي/);const item={productId:p.id,variationId:row.id,size:'9',engraving:'يا علي'};assert.match(selectionMessage([item],[p]),/Colour: Green/);assert.match(selectionMessage([item],[p]),new RegExp(row.sku));assert.equal(V.variationSnapshot(p,item).options.length,3);
 const sized={...p,variationOptions:p.variationOptions.map(o=>o.name==='Size'?{...o,values:['Large']}:o),variations:[{...row,options:{...row.options,[p.variationOptions[1].id]:'Large'}}]};const customSize=draftForProduct(sized,row.id);assert.equal(stepIssue(2,customSize,[sized]),'');assert.match(ringBrief(customSize,'',sized),/Ring size: Large/);assert.doesNotMatch(ringBrief(customSize,'',sized),/US Large/);
});

const C=await import(moduleURL('lib/product-commerce.ts'));
test('product attributes support all requested presets and reject duplicate names and values',()=>{
 assert.deepEqual(C.attributePresets,['Color','Item Length','Metal','Number of Gemstones','Main Stone Depth','Main Stone Length','Main Stone Width','Theme']);const attributes=C.attributePresets.map(name=>({id:crypto.randomUUID(),name,values:['12 mm']}));assert.equal(C.parseProductCommerce({attributes}).attributes.length,8);assert.throws(()=>C.parseProductCommerce({attributes:[...attributes,{id:crypto.randomUUID(),name:'metal',values:['Silver']}]}),/own name/);assert.throws(()=>C.parseProductCommerce({attributes:[{id:crypto.randomUUID(),name:'Color',values:['Green',' green ']}]}),/repeated/);assert.equal(C.parseProductCommerce({attributes:[{id:crypto.randomUUID(),name:'',values:[]}]}).attributes.length,1);
});
test('scheduled listings remain private before the exact instant and drafts and archived records remain hidden',()=>{
 const at=Date.parse('2026-12-01T15:00:00+05:00'),p={published:true,publishAt:'2026-12-01T15:00:00+05:00'};assert.equal(C.listingIsPublic(p,at-1),false);assert.equal(C.listingIsPublic(p,at),true);assert.equal(C.listingIsPublic({...p,published:false},at+1),false);assert.equal(C.listingIsPublic({...p,archivedAt:'today'},at+1),false);assert.equal(C.listingIsPublic({published:true,publishAt:'invalid'},at),false);
});
test('quantity discounts count variants of the same product together and apply only the highest tier',()=>{
 const p={...fixture(),price:100,volumePricingEnabled:true,quantityDiscounts:[{minimum:2,percent:10},{minimum:3,percent:15},{minimum:4,percent:20}]},one={productId:p.id,variationId:p.variations[0].id,size:'9',engraving:''},other={...one,variationId:p.variations[1].id};for(const [quantity,expected] of [[1,10000],[2,18000],[3,25500],[4,32000],[7,56000]]){const result=C.quantityPricing(Array.from({length:quantity},(_,i)=>i?other:one),[p]);assert.equal(result.totalMinor,expected)}const mixed=C.quantityPricing([one,{...one,productId:'different'}],[p,{...p,id:'different'}]);assert.equal(mixed.hasDiscount,false);const foreign=C.agreedQuantityPricing([one,other],[p],'USD',[{key:C.priceKey(one),amountMinor:1000},{key:C.priceKey(other),amountMinor:2000}]);assert.equal(foreign.totalMinor,2700);assert.throws(()=>C.agreedQuantityPricing([one,other],[p],'USD',undefined),/agreed unit prices/);
});
test('tier settings validate minimums, fractional percentages, duplicate quantities and decreasing discounts',()=>{
 for(const tiers of [[{minimum:1,percent:10}],[{minimum:2,percent:0}],[{minimum:2,percent:10},{minimum:2,percent:20}],[{minimum:2,percent:15},{minimum:3,percent:10}],[{minimum:2,percent:10.001}]])assert.throws(()=>C.parseProductCommerce({volumePricingEnabled:true,quantityDiscounts:tiers}));const result=C.parseProductCommerce({volumePricingEnabled:true,quantityDiscounts:[{minimum:4,percent:20},{minimum:2,percent:10}]});assert.equal(result.quantityDiscounts[0].minimum,2);
});
test('quote rounding is performed in minor units and supplied prices must match every selected combination',()=>{
 const p={...fixture(),price:10.01,volumePricingEnabled:true,quantityDiscounts:[{minimum:2,percent:15}]},item={productId:p.id,variationId:p.variations[0].id,size:'9',engraving:''};assert.equal(C.quantityPricing([item,item],[p]).totalMinor,1702);assert.throws(()=>C.quantityPricing([item,item],[p],[{key:'invented',amountMinor:100}]),/every selected/);assert.equal(C.quantityPricing([item,item],[{...p,price:null}]).totalMinor,null);
});
