import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
const modules=new Map();
function moduleURL(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;js=js.replace(/from\s+(['"])(\.\.?\/[^'"]+)\1/g,(_,q,relative)=>`from '${moduleURL(path.resolve(path.dirname(file),relative+'.ts'))}'`);const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');modules.set(file,url);return url}
const {catalog}=await import(moduleURL('lib/catalog.ts'));
const {matchesSearch,validWishlist}=await import(moduleURL('lib/search.ts'));
const {convertAmount,isCurrency,money}=await import(moduleURL('lib/currency.ts'));
const {currencyForCountry,locationPreference,locationResponse}=await import(moduleURL('lib/location.ts'));
const find=q=>catalog.filter(p=>matchesSearch(p,q));
test('search handles names, aliases, case, punctuation and SKU',()=>{
 assert.equal(find('  TURQUOISE  ').length,12);assert.equal(find('Firoza Imam Husayn').length,1);assert.equal(find('firoza hussein')[0].id,'WS-203');assert.equal(find('Durr-e-Najaf').length,12);assert.equal(find('yaqood')[0].stone,'Yaqoot');assert.equal(find('zabarjad')[0].stone,'Peridot');assert.equal(find('WS-701')[0].stone,'Emerald');assert.equal(find('عقیق').length,12);assert.equal(find('nonexistent-product').length,0);assert.equal(find('   ').length,52);
});
test('guest imports discard unknown IDs, duplicates and malformed values',()=>{assert.deepEqual(validWishlist(['WS-101','bad','WS-101',null,34,'WS-701'],catalog.map(p=>p.id)),['WS-101','WS-701']);assert.deepEqual(validWishlist({id:'WS-101'},[]),[])});
test('currency conversion preserves unpriced values and rounds display only',()=>{assert.equal(convertAmount(null,.0036),null);assert.equal(convertAmount(2500,.00361),9.03);assert.equal(convertAmount(100,1),100);assert.throws(()=>convertAmount(10,0));assert.throws(()=>convertAmount(-1,1));assert.throws(()=>convertAmount(Infinity,1));assert.equal(isCurrency('USD'),true);assert.equal(isCurrency('BTC'),false);assert.match(money(100,'PKR'),/PKR/)});
test('visitor country selects the correct local currency, including priority markets',()=>{
 for(const [country,currency] of Object.entries({PK:'PKR',US:'USD',GB:'GBP',FR:'EUR',BG:'EUR',CA:'CAD',AU:'AUD',NZ:'NZD',IN:'INR',IQ:'IQD',IR:'IRR',ZA:'ZAR',KE:'KES',NG:'NGN',AE:'AED',SA:'SAR',JP:'JPY'}))assert.equal(currencyForCountry(country),currency,country);
 for(const unknown of [null,undefined,'XX','T1','not-a-country','',123])assert.equal(currencyForCountry(unknown),'PKR');
 assert.equal(currencyForCountry(' gb '),'GBP');
});
test('locale lookup prefers edge country, does not cache visitors and never exposes their IP',async()=>{
 const request=new Request('https://example.com/api/locale?country=IR',{headers:{'cf-ipcountry':'GB','cf-connecting-ip':'192.0.2.1'}});Object.defineProperty(request,'cf',{value:{country:'CA'}});
 assert.deepEqual(locationPreference(request),{country:'CA',currency:'CAD',source:'country'});
 const response=locationResponse(request);assert.match(response.headers.get('Cache-Control'),/private.*no-store/);assert.equal(response.headers.get('CDN-Cache-Control'),'no-store');assert.deepEqual(await response.json(),{country:'CA',currency:'CAD',source:'country'});
 assert.deepEqual(locationPreference(new Request('https://example.com/api/locale',{headers:{'cf-ipcountry':'FR'}})),{country:'FR',currency:'EUR',source:'country'});
 assert.equal(locationResponse(new Request('https://example.com/api/locale',{method:'POST'})).status,405);
});
test('display rounding respects zero and three decimal currencies while retaining PKR cents',()=>{
 assert.equal(convertAmount(100,.123456,'JPY'),12);assert.equal(convertAmount(100,.123456,'KWD'),12.346);assert.equal(convertAmount(100.25,1,'PKR'),100.25);assert.match(money(100.25,'PKR'),/100\.25/);
});
