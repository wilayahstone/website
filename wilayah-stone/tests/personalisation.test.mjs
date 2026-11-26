import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
const require=createRequire(import.meta.url),modules=new Map();
function moduleURL(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;js=js.replace(/from\s+(['"])([^'"]+)\1(?=;)/g,(_,q,s)=>s.startsWith('.')?`from '${moduleURL(path.resolve(path.dirname(file),s+'.ts'))}'`:`from '${pathToFileURL(require.resolve(s)).href}'`);const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');modules.set(file,url);return url}
const {catalog,imams}=await import(moduleURL('lib/catalog.ts'));
const {draftForProduct,selectedProduct,engravingText,restoreRingDraft,stepIssue,ringBrief,personalisationMessage}=await import(moduleURL('lib/personalisation.ts'));

test('every catalogue entry can begin a personalisation with the exact stone and Imam variant',()=>{
 for(const product of catalog){const draft=draftForProduct(product);assert.equal(selectedProduct(catalog,draft).id,product.id);assert.equal(engravingText(draft),product.engraving==='Plain'?'Plain stone':product.engraving);assert.equal(stepIssue(0,draft,catalog),'');assert.equal(stepIssue(1,draft,catalog),'');}
});
test('a withdrawn or unavailable engraving cannot silently become another Imam design',()=>{
 const product=catalog.find(p=>p.id==='WS-412'),draft=draftForProduct(product),without=catalog.filter(p=>p.id!==product.id);
 assert.equal(selectedProduct(without,draft),undefined);assert.match(stepIssue(1,draft,without),/Choose a name/);
 const unavailable=catalog.map(p=>p.id===product.id?{...p,status:'Unavailable'}:p);assert.equal(selectedProduct(unavailable,draft),undefined);
});
test('custom words and image-only designs require an intentional brief and preserve the customer script',()=>{
 const draft={...draftForProduct(catalog[0]),mode:'custom',size:'Need sizing help',custom:'  يا علي  ',notes:'Oval setting, please.',sizeNotes:'Please discuss the fit with me.'};
 assert.equal(engravingText(draft),'يا علي');assert.equal(stepIssue(1,draft,catalog),'');assert.equal(stepIssue(2,draft,catalog),'');
 assert.match(ringBrief(draft),/يا علي/);assert.match(personalisationMessage(draft,selectedProduct(catalog,draft),'engraving.png'),/attach my design image/);
 assert.match(personalisationMessage(draft,selectedProduct(catalog,draft)),/delivery-by date/);
 assert.match(stepIssue(1,{...draft,custom:'   '},catalog),/text or a design image/);assert.equal(stepIssue(1,{...draft,custom:''},catalog,true),'');
});
test('saved choices reject malformed drafts and resume at a step that can actually be completed',()=>{
 const ready={...draftForProduct(catalog[0]),size:'9.5',step:3};assert.deepEqual(restoreRingDraft(JSON.stringify(ready),catalog),ready);
 for(const raw of ['{',JSON.stringify({...ready,version:99}),JSON.stringify({...ready,size:'100'}),JSON.stringify({...ready,stone:'invented'}),JSON.stringify({...ready,notes:'x'.repeat(1601)})])assert.equal(restoreRingDraft(raw,catalog),null);
 assert.equal(restoreRingDraft(JSON.stringify({...ready,size:''}),catalog).step,2);
 assert.equal(restoreRingDraft(JSON.stringify({...ready,mode:'custom',custom:''}),catalog).step,1);
 const restored=restoreRingDraft(JSON.stringify({...ready,email:'not-persisted@example.com',uploadId:'private-token'}),catalog);assert.equal(restored.email,undefined);assert.equal(restored.uploadId,undefined);
});
test('a completed brief stays within backend limits and records sizing help without inventing a size',()=>{
 const draft={...draftForProduct(catalog[0]),mode:'custom',custom:'ع'.repeat(300),size:'Need sizing help',sizeNotes:'s'.repeat(500),notes:'n'.repeat(1600)};
 const notes=ringBrief(draft,'f'.repeat(255)+'.png');assert.ok(notes.length<=3000,notes.length);assert.match(notes,/Sizing help requested/);assert.doesNotMatch(notes,/US Need/);
 assert.match(stepIssue(2,{...draft,size:''},catalog),/Choose your ring size/);
});

test('every Imam catalogue name includes AS, and old saved al-Kazim choices retain the correct design',async()=>{const {imamName,respectfulText}=await import(moduleURL('lib/imams.ts'));for(const product of catalog.filter(p=>p.engraving!=='Plain')){assert.match(product.name,/\(AS\)$/);assert.match(product.engraving,/\(AS\)$/);assert.doesNotMatch(product.description,/\(AS\) \(AS\)/)}assert.equal(imamName('Imam Musa al-Kazim'),'Imam Musa al-Kadhim (AS)');const draft={...draftForProduct(catalog.find(p=>p.id==='WS-207')),imam:'Imam Musa al-Kazim',size:'9',step:3};const restored=restoreRingDraft(JSON.stringify(draft),catalog);assert.equal(selectedProduct(catalog,restored).id,'WS-207');assert.equal(respectfulText('Imam Ali al-Rida and Imam Ali (AS). Ahlul Bayt.'),'Imam Ali al-Rida (AS) and Imam Ali (AS). Ahlul Bayt (AS).')});

test('new catalogue products keep their exact identity and uploaded views in personalisation',()=>{const product={...catalog[0],id:'PRD-NEW-RING',sku:'CUSTOM-RING',engraving:'يا علي',custom:true,imageIds:['image-front','image-detail']};const draft=draftForProduct(product);assert.equal(draft.productId,product.id);assert.equal(draft.mode,'custom');assert.equal(draft.custom,'يا علي');assert.equal(selectedProduct([...catalog,product],draft).id,product.id);assert.equal(selectedProduct(catalog,draft),undefined);assert.match(stepIssue(0,draft,catalog),/available design/)});
