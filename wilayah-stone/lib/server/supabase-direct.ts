import {runtime} from './runtime';
const kinds=new Set(['product','request','enquiry','audit','supplier','post','setting','wishlist','upload','staff','quote','order','fx-cache','rate-limit','privacy-request']);
export function usesDirectSupabase(){const env=runtime();return env.HOSTING_PLATFORM==='node'&&!!env.SUPABASE_SECRET_KEY}
function settings(){const env=runtime(),url=new URL(env.SUPABASE_URL||'');if(url.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(url.hostname)||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('Invalid Supabase server URL');const key=env.SUPABASE_SECRET_KEY;if(!key||key.startsWith('sb_publishable_'))throw Error('Supabase server credential is missing');if(!key.startsWith('sb_secret_')){try{if(JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role!=='service_role')throw Error()}catch{throw Error('Supabase server credential is invalid')}}return {origin:url.origin,key,bucket:env.SUPABASE_STORAGE_BUCKET||'design-references'}}
async function api(path:string,init:RequestInit={}){const {origin,key}=settings(),headers=new Headers(init.headers);headers.set('apikey',key);if(!key.startsWith('sb_secret_'))headers.set('Authorization','Bearer '+key);if(init.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');return fetch(origin+path,{...init,headers,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)})}
async function db(path:string,init:RequestInit={}):Promise<any>{const response=await api('/rest/v1/'+path,init);if(!response.ok){console.error('[store backend] Supabase database request failed',response.status);throw Error('Store database unavailable')}return response.status===204?null:response.json()}
const text=(value:unknown,max=300)=>{if(typeof value!=='string'||!value.length||value.length>max)throw Error('Invalid store reference');return value};
const kind=(value:unknown)=>{const result=text(value,50);if(!kinds.has(result))throw Error('Invalid store collection');return result};
const rpc=(name:string,data:unknown)=>db('rpc/'+name,{method:'POST',body:JSON.stringify(data)});
export async function directRecord(op:string,a:any):Promise<any>{
 if(op==='health'){await db('ws_records?select=id&limit=1');return {ok:true}}
 if(op==='register-password-customer'){
  if(typeof a.email!=='string'||a.email.length>200||!/^\S+@\S+\.\S+$/.test(a.email)||typeof a.password!=='string'||a.password.length<8||new TextEncoder().encode(a.password).length>72)return {outcome:'invalid'};
  const response=await api('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email:a.email,password:a.password,email_confirm:true,app_metadata:{ws_signup:'password'}})});
  if(response.ok)return {outcome:'created'};const error:any=await response.json().catch(()=>({})),code=error.code||error.error_code;
  if(['user_already_exists','email_exists','email_address_already_exists'].includes(code)||response.status===409)return {outcome:'taken'};
  if(code==='weak_password')return {outcome:'weak'};
  if(response.status===429)return {outcome:'limited'};
  if([400,422].includes(response.status))return {outcome:'invalid'};
  console.error('[store backend] Customer creation rejected by Supabase',response.status);return {outcome:'unavailable'};
 }
 if(op==='get'){const q=new URLSearchParams({select:'*',id:'eq.'+text(a.id),limit:'1'});if(a.kind)q.set('kind','eq.'+kind(a.kind));return (await db('ws_records?'+q))[0]||null}
 if(op==='list'){const q=new URLSearchParams({select:'*',kind:'eq.'+kind(a.kind),order:'created.desc,id.desc',limit:String(Math.min(500,Math.max(1,Number(a.limit)||100))),offset:String(Math.min(100000,Math.max(0,Number(a.offset)||0)))});if(a.owner!==undefined)q.set('owner','eq.'+text(a.owner));return db('ws_records?'+q)}
 if(op==='save')return rpc('ws_save_record',{p_id:text(a.id),p_kind:kind(a.kind),p_owner:text(a.owner),p_data:a.data}).then(result=>{if(!result)throw Error('Record ownership conflict');return true});
 if(op==='insert')return (await db('ws_records',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({id:text(a.id),kind:kind(a.kind),owner:text(a.owner),data:a.data})})).length>0;
 if(op==='compare')return rpc('ws_compare_record',{p_id:text(a.id),p_kind:kind(a.kind),p_owner:text(a.owner),p_previous:a.previous,p_data:a.data});
 if(op==='catalogue-save')return rpc('ws_save_catalogue_product',{p_id:text(a.id,30),p_previous:a.previous??null,p_data:a.data});
 if(op==='delete'){await db('ws_records?'+new URLSearchParams({id:'eq.'+text(a.id),owner:'eq.'+text(a.owner)}),{method:'DELETE'});return true}
 if(op==='rate'){if(!Number.isInteger(a.limit)||a.limit<1||a.limit>500)throw Error('Invalid request limit');return rpc('ws_consume_rate',{p_owner:text(a.owner,200),p_limit:a.limit})}
 if(op==='auth-session'){if(!/^[a-f0-9-]{36}$/i.test(a.sessionId||'')||!/^[a-f0-9-]{36}$/i.test(a.userId||''))return false;return rpc('ws_admin_session_active',{p_session_id:a.sessionId,p_user_id:a.userId})}
 if(op==='merge'){if(!Array.isArray(a.ids)||a.ids.length>100)throw Error('Invalid favourites');const owner=text(a.owner);if(a.ids.length)await db('ws_records',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify(a.ids.map((value:unknown)=>{const id=text(value,50);return {id:`wish:${owner}:${id}`,kind:'wishlist',owner,data:{productId:id}}}))});return true}
 throw Error('Unsupported store operation');
}
export async function directFile(id:string,init:RequestInit={}){
 if(!/^[a-f0-9-]{36}$/i.test(id))throw Error('Invalid file reference');const bucket=encodeURIComponent(settings().bucket),method=init.method||'GET';let response:Response;
 if(method==='DELETE')response=await api('/storage/v1/object/'+bucket,{method,body:JSON.stringify({prefixes:[id]})});
 else response=await api('/storage/v1/object/'+(method==='GET'?'authenticated/':'')+bucket+'/'+id,init);
 if(!response.ok)throw Error('Store file unavailable');return response;
}
