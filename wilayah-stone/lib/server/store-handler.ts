import {z} from 'zod';
import type {StoreUser} from '../identity';
import {journalData,journalPublic,respectfulJournal} from '../journal';
import {readiness} from '../readiness';
import {getProducts} from './products';
import {saveProduct} from './product-editor';
import {archiveRecord,recycleBin} from './record-archive';
import {runtime} from './runtime';
import {backend,listRecords,getRecord,saveRecord,insertRecord,compareAndSet,deleteRecord,mergeWishlist,consumeRate,putUpload,getUpload,deleteUpload} from './data';
import {getStaff,can,audit,teamList,updateTeam,Staff} from './access';
import {roles,normaliseEmail,Permission} from '../permissions';
import {publicSupport,supportReference,supportStatuses} from '../support';
import {findVariation,hasVariations,selectionIssue,variationProduct,variationSnapshot} from '../variations';
import {quoteSchema,validQuoteDates} from '../commerce';
import {destinationName} from '../markets';
import {agreedQuantityPricing} from '../product-commerce';
import {getOrdering,publicOrdering,operationsGET,saveOperation,saveOrdering,createManualOrder,updateManualOrder,orderView} from './operations';
import {HttpError,json,requireSameOrigin,readLimited,readJson,imageMatches,safeFilename} from '../http';
const known=async(id:string)=>(await getProducts()).some(p=>p.id===id);
const allowedStatuses=['New enquiry','Specification review','Supplier confirmation','Proof review','Ready to quote','Closed'] as const;
const kindPermission:Record<string,Permission>={request:'requests.read',supplier:'suppliers.read',post:'journal.read',enquiry:'support.read',audit:'audit.read',order:'requests.read',quote:'quotes.write','privacy-request':'support.read'};
function requirePermission(staff:Staff|null,permission:Permission):asserts staff is Staff{if(!staff||!can(staff.role,permission))throw new HttpError(403,'You do not have access to this operation.')}
function publicRequest(r:any){return {...r,data:{...r.data,staffNotes:undefined,internalReview:undefined,archivedBy:undefined,archiveReason:undefined}}}
function publicOrder(r:any){const o=orderView(r).data;const {quoteId,currency,amountMinor,shippingMinor,paymentStatus,status,paidAt}=o;return {id:r.id,created:r.created,updated:r.updated,data:{quoteId,currency,amountMinor,shippingMinor,paymentStatus,status,paidAt,selectionSnapshot:o.selectionSnapshot,quantityPricing:o.quantityPricing,receivedMinor:o.receivedMinor,refundedMinor:o.refundedMinor,balanceMinor:o.balanceMinor,timeline:(o.timeline||[]).map((t:any)=>({status:t.status,at:t.at}))}}}
async function pageRecords(kind:string,offset=0,owner?:string){const rows=await listRecords(kind,owner,51,offset);return {rows:rows.slice(0,50).filter(r=>!r.data.archivedAt),nextOffset:rows.length>50?offset+50:null}}
function paymentInfo(){return {mode:'manual',online:false,cod:false}}
export async function storeGET(req:Request,u:StoreUser|null){try{
 const url=new URL(req.url),view=url.searchParams.get('view'),adminRequest=url.pathname==='/api/admin';if(!adminRequest&&['admin','records','operations','ordering-settings','reports','trash'].includes(view||''))throw new HttpError(403,'Sign in to the admin portal.');
 if(view==='identity'){const staff=adminRequest?await getStaff(u):null;return json({userId:u?.userId||null,admin:!!staff,role:staff?.role||null,permissions:staff?.permissions||[]})}
 if(view==='upload'){
  if(!u)throw new HttpError(401,'Please sign in to open this design.');const id=z.string().uuid().parse(url.searchParams.get('id')),record=await getRecord(id,'upload');
  if(!record)throw new HttpError(404,'Design not found.');if(record.owner!==u.userId)requirePermission(adminRequest?await getStaff(u):null,'requests.read');
  const body=await getUpload(id);if(!body)throw new HttpError(404,'Design not found.');
  return new Response(body,{headers:{'Content-Type':record.data.type,'Content-Disposition':`attachment; filename="${safeFilename(record.data.name)}"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }
 if(view==='export'){
  if(!u)throw new HttpError(401,'Please sign in to export your data.');if(!await consumeRate('export:'+u.userId,5))throw new HttpError(429,'Please try the export again later.');
  const personal=await Promise.all(['request','enquiry','wishlist','upload','quote','order','privacy-request'].map(async kind=>{const records=await listRecords(kind,u.userId,500);return {kind,mayHaveMore:records.length===500,records:records.map(r=>kind==='request'?publicRequest(r):kind==='order'?publicOrder(r):kind==='enquiry'||kind==='privacy-request'?publicSupport(r):r)}}));
  return json({exportedAt:new Date().toISOString(),complete:!personal.some(p=>p.mayHaveMore),notice:personal.some(p=>p.mayHaveMore)?'For records beyond this export, request Export assistance from your account.':undefined,account:{id:u.userId,email:u.email},records:personal},200,{'Content-Disposition':'attachment; filename="wilayah-stone-account.json"'});
 }
 if(['operations','ordering-settings','reports'].includes(view||'')){const staff=await getStaff(u);if(!staff)throw new HttpError(403,'Sign in with an authorised staff account.');return await operationsGET(req,staff)}
 if(view==='trash'){const staff=await getStaff(u);if(!staff)throw new HttpError(403,'Sign in with your work email.');return await recycleBin(req,staff)}
 if(view==='admin'||view==='records'){
  const staff=await getStaff(u);if(!staff)throw new HttpError(403,'Sign in with an authorised staff account.');
  if(view==='records'){const kind=url.searchParams.get('kind')||'',perm=kindPermission[kind];if(!perm)throw new HttpError(400,'Unknown record collection.');requirePermission(staff,perm);const offset=z.coerce.number().int().min(0).max(100000).parse(url.searchParams.get('offset')||0);return json(await pageRecords(kind,offset))}
  const kinds=Object.keys(kindPermission),pages=await Promise.all(kinds.map(async kind=>can(staff.role,kindPermission[kind])?pageRecords(kind):{rows:[],nextOffset:null}));
  const by=Object.fromEntries(kinds.map((kind,i)=>[kind,pages[i].rows])),pagination=Object.fromEntries(kinds.map((kind,i)=>[kind,pages[i].nextOffset]));
  return json({role:staff.role,permissions:staff.permissions,backend:backend(),products:can(staff.role,'catalog.read')?await getProducts(true):[],requests:by.request,enquiries:by.enquiry,suppliers:by.supplier,posts:by.post.map(respectfulJournal),audit:by.audit,orders:by.order.map(orderView),quotes:by.quote,privacyRequests:by['privacy-request'],team:can(staff.role,'roles.manage')?await teamList():[],pagination,tasks:can(staff.role,'governance.read')?readiness:[],payment:can(staff.role,'payments.read')?paymentInfo():null});
 }
 const staff=adminRequest?await getStaff(u):null;
 const [products,posts,wishlist,requests,quotes,orders,enquiries]=await Promise.all([getProducts(),listRecords('post',undefined,100),u?listRecords('wishlist',u.userId,100):[],u?listRecords('request',u.userId,100):[],u?listRecords('quote',u.userId,100):[],u?listRecords('order',u.userId,100):[],u?listRecords('enquiry',u.userId,100):[]]);
 return json({products,posts:posts.filter(journalPublic).map(respectfulJournal),wishlist:wishlist.map(r=>r.data.productId),requests:requests.map(publicRequest),quotes:quotes.filter(r=>r.data.state!=='withdrawn').map(r=>({...r,data:{...r.data,archivedBy:undefined,archiveReason:undefined}})),orders:orders.map(publicOrder),enquiries:enquiries.map(publicSupport),enquiriesMayHaveMore:enquiries.length===100,signedIn:!!u,admin:!!staff,role:staff?.role||null,ordering:await publicOrdering(),aiEnabled:!!runtime().AI_GATEWAY_URL&&!!runtime().AI_GATEWAY_KEY});
 }catch(e){return fail(e,true)}}
export async function storePOST(req:Request,u:StoreUser|null){try{
 requireSameOrigin(req);if(!u)throw new HttpError(401,'Please sign in to continue.');
 if(!await consumeRate(u.userId,120))return json({error:'Too many requests. Please try again later.'},429,{'Retry-After':'3600'});
 if(req.headers.get('content-type')?.startsWith('multipart/form-data')){
  if(!await consumeRate('upload:'+u.userId,20))throw new HttpError(429,'Please try uploading again later.');
  const bytes=await readLimited(req,6*1024*1024),form=await new Response(bytes as BodyInit,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData(),file=form.get('file');
  if(!(file instanceof File)||!file.size||file.size>5*1024*1024)throw new HttpError(400,'Choose a PNG, JPEG or WebP image up to 5 MB.');const data=new Uint8Array(await file.arrayBuffer());
  if(!imageMatches(data,file.type))throw new HttpError(400,'The image format could not be read. Please choose a PNG, JPEG or WebP.');
  const id=crypto.randomUUID();await putUpload(id,data,file.type);try{await saveRecord(id,'upload',u.userId,{name:safeFilename(file.name),type:file.type,size:file.size,storage:backend()})}catch(e){try{await deleteUpload(id)}catch{}throw e}return json({id});
 }
 const b=await readJson(req,new URL(req.url).pathname==='/api/admin'?350000:100000);if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Please send a valid request.');const action=z.string().min(1).max(40).parse(b.action);
 if(action==='wishlist'){const productId=z.string().max(30).parse(b.productId),saved=z.boolean().parse(b.saved);if(saved&&!await known(productId))throw new HttpError(400,'This design is unavailable.');const key=`wish:${u.userId}:${productId}`;if(saved)await saveRecord(key,'wishlist',u.userId,{productId});else await deleteRecord(key,u.userId);return json({ok:true})}
 if(action==='wishlist-merge'){const ids=[...new Set(z.array(z.string()).max(100).parse(b.productIds))];const products=await getProducts();if(ids.some(id=>!products.some(p=>p.id===id)))throw new HttpError(400,'One of the saved designs is unavailable.');await mergeWishlist(u.userId,ids);return json({wishlist:(await listRecords('wishlist',u.userId,100)).map(r=>r.data.productId)})}
 if(action==='request'){
  const key=z.string().uuid().parse(b.idempotencyKey),data=z.object({items:z.array(z.object({productId:z.string().max(30),variationId:z.string().uuid().optional(),variationVersion:z.string().max(100).optional(),size:z.string().min(1).max(30),engraving:z.string().max(300)})).min(1).max(100),name:z.string().trim().min(2).max(100),email:z.string().email().max(200),country:z.string().transform(v=>destinationName(v)).refine((v):v is string=>!!v,'Choose a destination country'),notes:z.string().max(3000),uploadId:z.string().uuid().optional(),consent:z.literal(true)}).parse(b.data);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(u.userId+':'+key)),id='WSR-'+Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');const existing=await getRecord(id,'request');const matches=(r:any)=>Object.keys(data).every(k=>JSON.stringify(r.data[k])===JSON.stringify((data as any)[k]));if(existing){if(existing.owner!==u.userId||!matches(existing))throw new HttpError(409,'This request reference was already used. Refresh the form before sending different details.');return json({id:existing.id})}
  const products=await getProducts();if(data.items.some(i=>!products.some(p=>p.id===i.productId&&p.status!=='Unavailable')))throw new HttpError(400,'A selected design is unavailable.');
  for(const item of data.items){const product=products.find(product=>product.id===item.productId)!;const issue=selectionIssue(product,item);if(issue)throw new HttpError(400,issue);if(item.variationId&&product.updated&&item.variationVersion!==product.updated)throw new HttpError(409,'These product options have changed. Open the product again and review your selection.')}
  if(data.uploadId){const upload=await getRecord(data.uploadId,'upload');if(upload?.owner!==u.userId)throw new HttpError(400,'Please upload your design again.')}
  const created=await insertRecord(id,'request',u.userId,{...data,status:'New enquiry',paymentStatus:'Not collected',snapshot:data.items.map(i=>({...i,product:products.find(p=>p.id===i.productId),selection:variationSnapshot(products.find(p=>p.id===i.productId)!,i)})),timeline:[{at:new Date().toISOString(),status:'New enquiry'}],privacyVersion:'2026-10-30'});if(!created){const saved=await getRecord(id,'request');if(!saved||saved.owner!==u.userId||!matches(saved))throw new HttpError(409,'This request changed. Refresh the form before continuing.')}return json({id});
 }
 if(action==='enquiry'){
  const key=z.string().uuid().parse(b.idempotencyKey),data=z.object({email:z.string().trim().email().max(200),subject:z.string().trim().min(3).max(150).refine(v=>!/[\x00-\x1f\x7f]/.test(v)),message:z.string().trim().min(5).max(3000)}).parse(b.data);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(u.userId+':'+key)),id='WSE-'+Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const matches=(r:any)=>r.owner===u.userId&&Object.keys(data).every(k=>r.data[k]===(data as any)[k]);
  const existing=await getRecord(id,'enquiry');if(existing){if(!matches(existing))throw new HttpError(409,'This enquiry changed. Please send it again with a new reference.');return json({ok:true,id,reference:supportReference(existing)})}
  if(!await consumeRate('enquiry:'+u.userId,10))throw new HttpError(429,'Please wait before sending another enquiry.');
  const reference=supportReference({id});
  if(!await insertRecord(id,'enquiry',u.userId,{...data,reference,status:'Open'})){const saved=await getRecord(id,'enquiry');if(!saved||!matches(saved))throw new HttpError(409,'This enquiry changed. Please try again.');}
  return json({ok:true,id,reference});
 }
 if(action==='privacy-request'){const data=z.object({type:z.enum(['Deletion','Correction','Export assistance']),message:z.string().trim().min(5).max(3000)}).parse(b.data);if(!await consumeRate('privacy:'+u.userId,5))throw new HttpError(429,'Your request is already with us. Please try again later.');await saveRecord(crypto.randomUUID(),'privacy-request',u.userId,{...data,email:u.email,status:'Open'});return json({ok:true})}
 if(action==='recommend'){
  const prompt=z.string().trim().min(3).max(800).parse(b.prompt),products=await getProducts(),e=runtime();
  if(!e.AI_GATEWAY_URL||!e.AI_GATEWAY_KEY){const terms=prompt.toLowerCase().split(/\s+/).filter((t:string)=>t.length>2),scored=products.map(p=>({p,score:terms.filter((t:string)=>`${p.stone} ${p.engraving} ${p.description}`.toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score);return json({mode:'Catalogue keyword matches',ids:scored.filter(v=>v.score>0).slice(0,4).map(v=>v.p.id)})}
  const url=new URL(e.AI_GATEWAY_URL);if(url.protocol!=='https:'||url.hostname!=='gateway.ai.cloudflare.com'||!e.AI_MODEL)throw new HttpError(503,'Design matching is temporarily unavailable.');
  const r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${e.AI_GATEWAY_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:e.AI_MODEL,messages:[{role:'system',content:'Return JSON with ids, maximum 4, drawn only from this catalogue. Do not make religious, health, authenticity or availability claims. Catalogue: '+JSON.stringify(products.map(p=>({id:p.id,stone:p.stone,engraving:p.engraving})))},{role:'user',content:prompt}],response_format:{type:'json_object'},max_tokens:150}),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw new HttpError(503,'Design matching is temporarily unavailable.');const out:any=await r.json(),ids=JSON.parse(out.choices[0].message.content).ids;return json({mode:'AI Gateway catalogue recommendations',ids:Array.isArray(ids)?[...new Set(ids.filter((id:any)=>products.some(p=>p.id===id)))].slice(0,4):[]});
 }
 if(action==='checkout'||action==='accept-quote')throw new HttpError(409,'Please contact us to arrange your order. Orders and payment arrangements are handled directly with the team on WhatsApp. The website does not collect payment.');
 if(new URL(req.url).pathname!=='/api/admin')throw new HttpError(403,'Sign in to the admin portal.');const staff=await getStaff(u);if(!staff)throw new HttpError(403,'Staff access is required.');let changed:string|null=b.id||null;
 if(action==='archive-record'||action==='restore-record')return await archiveRecord(staff,b,action==='restore-record');
 if(action==='operation-save')return await saveOperation(staff,b);
 if(action==='ordering-settings')return await saveOrdering(staff,b);
 if(action==='manual-order')return await createManualOrder(staff,b);
 if(action==='order-status')return await updateManualOrder(staff,b);
 const editingId=b.id||(action==='product'?b.data?.id:null);if(editingId){const previous=await getRecord(editingId);if(previous?.data.archivedAt)throw new HttpError(409,'Restore this record from the recycle bin before editing.');}
 if(action==='team'){
  requirePermission(staff,'roles.manage');await updateTeam(staff,b.data);return json({ok:true});
 }else if(action==='product'){
  if(!staff)throw new HttpError(403,'Store access is required.');return await saveProduct(staff,b);
 }else if(action==='request-status'){
  requirePermission(staff,'requests.write');const id=z.string().max(300).parse(b.id),status=z.enum(allowedStatuses).parse(b.status),notes=z.string().max(3000).parse(b.notes||''),r=await getRecord(id,'request');if(!r)throw new HttpError(404,'Request not found.');if(!await compareAndSet(r,{...r.data,status,staffNotes:notes,timeline:[...(r.data.timeline||[]).slice(-99),{at:new Date().toISOString(),status}]}))throw new HttpError(409,'This request changed. Refresh and try again.');
 }else if(action==='quote'){
  requirePermission(staff,'quotes.write');const data=quoteSchema.parse(b.data);if(!validQuoteDates(data))throw new HttpError(400,'The quote expiry must be in the future and before the delivery date.');
  const r=await getRecord(data.requestId,'request');if(!r||r.data.archivedAt)throw new HttpError(404,'Request not found.');const products=await getProducts(true);
  const quantities=new Map<string,number>();for(const i of r.data.items)quantities.set(i.productId,(quantities.get(i.productId)||0)+1);
  if(r.data.items.some((i:any)=>{const base=products.find(p=>p.id===i.productId),p=base?variationProduct(base,i):undefined;return !p?.verified||!!(base&&selectionIssue(base,i))||!p.price||!p.supplier||p.status==='Unavailable'||p.capacity<(quantities.get(i.productId)||1)||p.deliveryDays<1}))throw new HttpError(409,'Complete product specifications, price, supplier allocation and lead time before issuing a quote.');
  const suppliers=await Promise.all([...new Set(r.data.items.map((i:any)=>products.find(p=>p.id===i.productId)!.supplier))].map(id=>getRecord(String(id),'supplier')));
  if(suppliers.some(s=>!s||s.data.confirmed!==true||s.data.capacity<r.data.items.filter((i:any)=>products.find(p=>p.id===i.productId)!.supplier===s.id).length))throw new HttpError(409,'Confirm the supplier reservation and available quantity before issuing a quote.');
  const days=Math.max(...r.data.items.map((i:any)=>products.find(p=>p.id===i.productId)!.deliveryDays));if(new Date(data.deliveryBy+'T23:59:59+05:00').getTime()<Date.now()+days*86400000)throw new HttpError(400,'The delivery date must allow the recorded production lead time.');
  let quantityPricing;try{quantityPricing=agreedQuantityPricing(r.data.items,products,data.currency,b.data.unitPrices)}catch(error){throw new HttpError(400,error instanceof Error?error.message:'Check quantity pricing.')}if(quantityPricing&&data.amountMinor!==quantityPricing.totalMinor!+data.shippingMinor)throw new HttpError(400,'The quote total must include the calculated quantity discount and shipping.');
  const id=crypto.randomUUID();changed=id;await insertRecord(id,'quote',r.owner,{...data,quantityPricing,state:'offered',issuedAt:new Date().toISOString(),items:r.data.items,selectionSnapshot:r.data.snapshot?.map((entry:any)=>entry.selection).filter(Boolean)||[],quantity:r.data.items.length});
 }else if(action==='withdraw-quote'){
  requirePermission(staff,'quotes.write');const r=await getRecord(z.string().uuid().parse(b.id),'quote');if(!r)throw new HttpError(404,'Quote not found.');if(r.data.state!=='offered')throw new HttpError(409,'Only an open quote may be withdrawn.');if(!await compareAndSet(r,{...r.data,state:'withdrawn'}))throw new HttpError(409,'This quote changed. Refresh and try again.');
 }else if(action==='supplier'){
  requirePermission(staff,'suppliers.write');const data=z.object({name:z.string().trim().min(2).max(100),stone:z.string().min(1).max(100),capacity:z.number().int().min(0).max(100000),leadDays:z.number().int().min(0).max(365),notes:z.string().min(5).max(3000),confirmed:z.boolean()}).parse(b.data);const id=b.id?z.string().uuid().parse(b.id):crypto.randomUUID();changed=id;const old=await getRecord(id,'supplier');if(old){if(b.expectedUpdatedAt!==old.updated)throw new HttpError(409,'This supplier changed. Refresh before saving.');const reserved=Object.values(old.data.orderAllocations||{}).reduce((n:number,v:any)=>n+Number(v.quantity||0),0);if(data.capacity<reserved)throw new HttpError(409,'Allocation cannot be reduced below units already assigned to orders.');if(!await compareAndSet(old,{...data,orderAllocations:old.data.orderAllocations||{}}))throw new HttpError(409,'The supplier allocation changed. Refresh before saving.');}else if(b.id||!await insertRecord(id,'supplier','store',data))throw new HttpError(409,'This supplier reference changed. Refresh before saving.');
 }else if(action==='post'){
  requirePermission(staff,'journal.write');const id=b.id?z.string().uuid().parse(b.id):crypto.randomUUID(),previous=b.id?await getRecord(id,'post'):null;if(b.id&&!previous)throw new HttpError(404,'Article not found.');if(previous&&b.expectedUpdatedAt!==previous.updated)throw new HttpError(409,'This article changed. Refresh before saving.');let data;try{data=journalData(b.data,previous?.data)}catch(e){if(e instanceof z.ZodError)throw e;throw new HttpError(400,e instanceof Error?e.message:'Check the article details.');}if(data.coverImageId){const media=await getRecord(data.coverImageId,'upload');if(media?.owner!=='store'||media.data.purpose!=='journal-cover')throw new HttpError(400,'Choose an article cover uploaded in the journal editor.');if(!data.coverAlt||data.coverAlt.trim().length<5)throw new HttpError(400,'Describe the cover image for screen readers.');}const duplicate=(await listRecords('post',undefined,500)).some(p=>p.id!==id&&p.data.slug===data.slug);if(duplicate)throw new HttpError(409,'Another article already uses that URL. Choose a different URL.');changed=id;if(previous){if(!await compareAndSet(previous,data))throw new HttpError(409,'This article changed. Refresh and try again.');}else if(!await insertRecord(id,'post','store',data))throw new HttpError(409,'This article was already created. Refresh the journal.');
 }else if(action==='support-update'){
  requirePermission(staff,'support.write');
  const data=z.object({id:z.string().min(1).max(300),kind:z.literal('enquiry'),status:z.enum(supportStatuses),notes:z.string().max(3000),response:z.string().trim().max(3000),expectedUpdatedAt:z.string().min(1).max(100)}).parse(b);
  const r=await getRecord(data.id,'enquiry');if(!r)throw new HttpError(404,'Enquiry not found.');
  if(data.expectedUpdatedAt!==r.updated)throw new HttpError(409,'This enquiry was updated by someone else. Refresh before saving your changes.');
  const now=new Date().toISOString(),responseChanged=data.response!==String(r.data.response||'');
  if(!await compareAndSet(r,{...r.data,status:data.status,staffNotes:data.notes,response:data.response,responseUpdatedAt:responseChanged?now:r.data.responseUpdatedAt,statusUpdatedAt:data.status!==r.data.status?now:r.data.statusUpdatedAt,handledBy:u.userId}))throw new HttpError(409,'This enquiry changed. Refresh and try again.');
  changed=r.id;
 }else if(action==='support-status'){
  requirePermission(staff,'support.write');const kind=z.enum(['enquiry','privacy-request']).parse(b.kind),r=await getRecord(z.string().max(300).parse(b.id),kind),status=z.enum(['Open','In progress','Resolved']).parse(b.status);if(!r)throw new HttpError(404,'Request not found.');if(!await compareAndSet(r,{...r.data,status}))throw new HttpError(409,'This request changed. Refresh and try again.');
 }else throw new HttpError(400,'Unknown operation.');
 await audit(staff,action,changed);return json({ok:true});
 }catch(e){return fail(e)}}
function fail(e:unknown,loading=false){if(e instanceof HttpError)return json({error:e.message},e.status);if(e instanceof z.ZodError)return json({error:'Please check the required fields and values.'},400);console.error('Store operation failed',e instanceof Error?{name:e.name,message:e.message.replace(/https?:\/\/\S+/g,'[service]').slice(0,200)}:'Unknown');return json({error:loading?'The store could not load. Please try again.':'Your changes could not be saved. Please try again.'},503)}
