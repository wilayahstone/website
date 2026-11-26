// Server-to-server bridge. The Site authenticates visitors and enforces RBAC.
// No service key or bridge secret is embedded in this source or sent to a browser.
const kinds=new Set(['product','request','enquiry','audit','supplier','post','setting','wishlist','upload','staff','quote','order','fx-cache','rate-limit','privacy-request']);
const enc=new TextEncoder();
function reply(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
async function bytes(req:Request,max:number){if(Number(req.headers.get('content-length'))>max)throw Error('size');const reader=req.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let n=0;try{while(true){const r=await reader.read();if(r.done)break;n+=r.value.length;if(n>max){await reader.cancel();throw Error('size')}chunks.push(r.value)}}finally{reader.releaseLock()}const all=new Uint8Array(n);let i=0;for(const c of chunks){all.set(c,i);i+=c.length}return all}
function service(){const modern=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');return {url:Deno.env.get('SUPABASE_URL')!,key:modern.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}}
async function api(path:string,init:RequestInit={}){const {url,key}=service(),headers=new Headers(init.headers);headers.set('apikey',key);if(!key.startsWith('sb_secret_'))headers.set('Authorization','Bearer '+key);if(init.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');return fetch(url+path,{...init,headers,signal:AbortSignal.timeout(12000),redirect:'error'})}
async function db(path:string,init:RequestInit={}){const r=await api('/rest/v1/'+path,init);if(!r.ok)throw Error('database');return r.status===204?null:r.json()}
function text(v:unknown,max=300){if(typeof v!=='string'||!v.length||v.length>max)throw Error('input');return v}
function kind(v:unknown){const s=text(v,50);if(!kinds.has(s))throw Error('input');return s}
async function authorised(req:Request){const key=req.headers.get('x-store-key')||'';if(!/^[a-f0-9]{64}$/.test(key))return false;const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(key)))].map(b=>b.toString(16).padStart(2,'0')).join('');const rows=await db('ws_server_keys?id=eq.website&select=key_hash&limit=1');const expected=rows?.[0]?.key_hash;if(typeof expected!=='string'||expected.length!==digest.length)return false;let diff=0;for(let i=0;i<digest.length;i++)diff|=digest.charCodeAt(i)^expected.charCodeAt(i);return diff===0}
Deno.serve(async(req:Request)=>{
 try{
  if(!['GET','POST','DELETE'].includes(req.method))return reply({error:'Method not allowed'},405);
  if(!await authorised(req))return reply({error:'Unauthorised'},401);
  const pathname=new URL(req.url).pathname;
  if(pathname.includes('/files/')){
   const id=pathname.split('/files/')[1];if(!/^[a-f0-9-]{36}$/.test(id))return reply({error:'Invalid file'},400);
   if(req.method==='GET'){const r=await api('/storage/v1/object/authenticated/design-references/'+id);return new Response(r.ok?r.body:null,{status:r.ok?200:r.status===404?404:503,headers:{'Cache-Control':'no-store','Content-Type':r.headers.get('content-type')||'application/octet-stream','X-Content-Type-Options':'nosniff'}})}
   if(req.method==='DELETE'){const r=await api('/storage/v1/object/design-references',{method:'DELETE',body:JSON.stringify({prefixes:[id]})});return reply({ok:r.ok},r.ok?200:503)}
   const type=req.headers.get('content-type')||'';if(!['image/png','image/jpeg','image/webp'].includes(type))return reply({error:'Unsupported file'},415);
   const body=await bytes(req,5242880);if(!body.length)return reply({error:'Empty file'},400);
   const r=await api('/storage/v1/object/design-references/'+id,{method:'POST',headers:{'Content-Type':type},body});return reply(r.ok?{ok:true}:{error:'Storage unavailable'},r.ok?200:503);
  }
  if(req.method!=='POST'||!pathname.endsWith('/records'))return reply({error:'Not found'},404);
  const {op,args:a}=JSON.parse(new TextDecoder().decode(await bytes(req,750000)));if(!a||typeof a!=='object')return reply({error:'Invalid request'},400);
  if(op==='register-password-customer'){
   const {email,password}=a;
   if(typeof email!=='string'||email.length>200||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<8||enc.encode(password).length>72)return reply({outcome:'invalid'});
   // The address is a login name. Only the provider-assigned UUID owns store records.
   // This store accepts immediate registration. No message or signup session is issued.
   const result=await api('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true,app_metadata:{ws_signup:'password'}})});
   if(result.ok)return reply({outcome:'created'});
   const error=await result.json().catch(()=>({}));
   if(['user_already_exists','email_exists','email_address_already_exists'].includes(error.error_code)||result.status===409)return reply({outcome:'taken'});
   if(error.error_code==='weak_password')return reply({outcome:'weak'});
   if(result.status===429)return reply({outcome:'limited'});
   if(result.status===400||result.status===422)return reply({outcome:'invalid'});
   return reply({outcome:'unavailable'});
  }
  if(op==='catalogue-save'){const id=text(a.id,30);if(!/^[A-Z0-9][A-Z0-9-]{2,29}$/.test(id)||!a.data||typeof a.data!=='object'||a.data.id!==id)return reply({ok:false,reason:'invalid'});return reply(await db('rpc/ws_save_catalogue_product',{method:'POST',body:JSON.stringify({p_id:id,p_previous:a.previous??null,p_data:a.data})}))}
  if(op==='health'){await db('ws_records?select=id&limit=1');return reply({ok:true})}
  if(op==='auth-session'){if(!/^[a-f0-9-]{36}$/i.test(a.sessionId||'')||!/^[a-f0-9-]{36}$/i.test(a.userId||''))return reply(false);return reply(await db('rpc/ws_admin_session_active',{method:'POST',body:JSON.stringify({p_session_id:a.sessionId,p_user_id:a.userId})}))}
  if(op==='list'){const q=new URLSearchParams({select:'*',kind:'eq.'+kind(a.kind),order:'created.desc,id.desc',limit:String(Math.min(500,Math.max(1,Number(a.limit)||100))),offset:String(Math.min(100000,Math.max(0,Number(a.offset)||0)))});if(a.owner!==undefined)q.set('owner','eq.'+text(a.owner));return reply(await db('ws_records?'+q))}
  if(op==='get'){const q=new URLSearchParams({select:'*',id:'eq.'+text(a.id),limit:'1'});if(a.kind)q.set('kind','eq.'+kind(a.kind));return reply((await db('ws_records?'+q))[0]||null)}
  if(op==='save'||op==='insert'){const id=text(a.id),owner=text(a.owner),k=kind(a.kind);if(op==='save'){const ok=await db('rpc/ws_save_record',{method:'POST',body:JSON.stringify({p_id:id,p_kind:k,p_owner:owner,p_data:a.data})});if(!ok)return reply({error:'Ownership conflict'},409);return reply(true)}const rows=await db('ws_records',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({id,owner,kind:k,data:a.data})});return reply(rows.length>0)}
  if(op==='compare')return reply(await db('rpc/ws_compare_record',{method:'POST',body:JSON.stringify({p_id:text(a.id),p_kind:kind(a.kind),p_owner:text(a.owner),p_previous:a.previous,p_data:a.data})}));
  if(op==='delete'){const q=new URLSearchParams({id:'eq.'+text(a.id),owner:'eq.'+text(a.owner)});await db('ws_records?'+q,{method:'DELETE'});return reply(true)}
  if(op==='rate'){if(!Number.isInteger(a.limit)||a.limit<1||a.limit>500)return reply({error:'Invalid limit'},400);return reply(await db('rpc/ws_consume_rate',{method:'POST',body:JSON.stringify({p_owner:text(a.owner,200),p_limit:a.limit})}))}
  if(op==='merge'){if(!Array.isArray(a.ids)||a.ids.length>100)return reply({error:'Invalid list'},400);const owner=text(a.owner);if(a.ids.length)await db('ws_records',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify(a.ids.map((v:unknown)=>{const id=text(v,50);return {id:`wish:${owner}:${id}`,kind:'wishlist',owner,data:{productId:id}}}))});return reply(true)}
  return reply({error:'Unknown operation'},400);
 }catch{return reply({error:'Store backend unavailable'},503)}
});
