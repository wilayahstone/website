import {usesDirectSupabase,directRecord,directFile} from './supabase-direct';
import {HttpError} from '../http';
import {runtime} from './runtime';
export type RecordRow<T=any>={id:string;kind:string;owner:string;data:T;created:string;updated:string};
export function backend(){return runtime().DATA_BACKEND==='supabase'?'supabase':'d1'}
function base(){const e=runtime();if(!e.SUPABASE_URL||!e.SUPABASE_BRIDGE_KEY)throw Error('Store connection unavailable');const url=new URL(e.SUPABASE_URL);if(url.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(url.hostname)||url.pathname!=='/'||url.search||url.hash)throw Error('Store connection unavailable');return {url:url.origin+'/functions/v1/store-backend',key:e.SUPABASE_BRIDGE_KEY}}
async function bridge(path:string,init:RequestInit={}){if(usesDirectSupabase()){if(path.startsWith('/files/'))return directFile(path.slice(7),init);throw Error('Unsupported direct backend path')}const {url,key}=base();const headers=new Headers(init.headers);headers.set('x-store-key',key);const r=await fetch(url+path,{...init,cache:'no-store',headers,signal:AbortSignal.timeout(15000),redirect:'manual'});if(!r.ok)throw Error('Store operation unavailable (HTTP '+r.status+')');return r}
async function call(op:string,args:unknown):Promise<any>{if(usesDirectSupabase())return directRecord(op,args);return (await bridge('/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op,args})})).json()}
function row(r:any):RecordRow{return {...r,data:typeof r.data==='string'?JSON.parse(r.data):r.data}}
export async function listRecords(kind:string,owner?:string,limit=100,offset=0):Promise<RecordRow[]>{
 limit=Math.min(500,Math.max(1,limit));offset=Math.max(0,offset);
 if(backend()==='supabase')return (await call('list',{kind,owner,limit,offset})).map(row);
 const q=owner!==undefined?runtime().DB.prepare('SELECT * FROM records WHERE kind=? AND owner=? ORDER BY created DESC,id DESC LIMIT ? OFFSET ?').bind(kind,owner,limit,offset):runtime().DB.prepare('SELECT * FROM records WHERE kind=? ORDER BY created DESC,id DESC LIMIT ? OFFSET ?').bind(kind,limit,offset);return (await q.all()).results.map(row);
}
export async function getRecord(id:string,kind?:string):Promise<RecordRow|null>{
 if(backend()==='supabase'){const r=await call('get',{id,kind});return r?row(r):null}
 const r=kind?await runtime().DB.prepare('SELECT * FROM records WHERE id=? AND kind=?').bind(id,kind).first():await runtime().DB.prepare('SELECT * FROM records WHERE id=?').bind(id).first();return r?row(r):null;
}
export async function saveRecord(id:string,kind:string,owner:string,data:unknown){
 if(backend()==='supabase'){await call('save',{id,kind,owner,data});return}
 const at=new Date().toISOString();const r=await runtime().DB.prepare('INSERT INTO records(id,kind,owner,data,created,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated WHERE records.kind=excluded.kind AND records.owner=excluded.owner').bind(id,kind,owner,JSON.stringify(data),at,at).run();if(!r.meta.changes)throw Error('Record ownership conflict');
}
export async function insertRecord(id:string,kind:string,owner:string,data:unknown){if(backend()==='supabase')return await call('insert',{id,kind,owner,data})===true;const at=new Date().toISOString();const r=await runtime().DB.prepare('INSERT INTO records(id,kind,owner,data,created,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,kind,owner,JSON.stringify(data),at,at).run();return r.meta.changes>0}
export async function compareAndSet(previous:RecordRow,data:unknown){if(backend()==='supabase')return await call('compare',{id:previous.id,kind:previous.kind,owner:previous.owner,previous:previous.data,data})===true;const r=await runtime().DB.prepare('UPDATE records SET data=?,updated=? WHERE id=? AND kind=? AND owner=? AND data=?').bind(JSON.stringify(data),new Date().toISOString(),previous.id,previous.kind,previous.owner,JSON.stringify(previous.data)).run();return r.meta.changes>0}
export async function deleteRecord(id:string,owner:string){if(backend()==='supabase'){await call('delete',{id,owner});return}await runtime().DB.prepare('DELETE FROM records WHERE id=? AND owner=?').bind(id,owner).run()}
export async function mergeWishlist(owner:string,ids:string[]){if(!ids.length)return;if(backend()==='supabase'){await call('merge',{owner,ids});return}const at=new Date().toISOString();await runtime().DB.batch(ids.map(id=>runtime().DB.prepare('INSERT INTO records(id,kind,owner,data,created,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(`wish:${owner}:${id}`,'wishlist',owner,JSON.stringify({productId:id}),at,at)))}
export async function consumeRate(owner:string,limit=120){if(backend()==='supabase')return await call('rate',{owner,limit})===true;const key=`limit:${owner}:${new Date().toISOString().slice(0,13)}`;for(let i=0;i<5;i++){const r=await getRecord(key,'rate-limit');if(!r){if(await insertRecord(key,'rate-limit',owner,{count:1}))return true;continue}if(r.data.count>=limit)return false;if(await compareAndSet(r,{count:r.data.count+1}))return true}return false}
export async function putUpload(id:string,bytes:Uint8Array,type:string){if(backend()==='supabase'){await bridge('/files/'+id,{method:'POST',headers:{'Content-Type':type},body:bytes as BodyInit});return}await runtime().BUCKET.put(id,bytes,{httpMetadata:{contentType:type}})}
export async function deleteUpload(id:string){if(backend()==='supabase'){await bridge('/files/'+id,{method:'DELETE'});return}await runtime().BUCKET.delete(id)}
export async function getUpload(id:string){if(backend()==='supabase'){try{return (await bridge('/files/'+id)).body}catch{return (await runtime().BUCKET.get(id))?.body||null}}return (await runtime().BUCKET.get(id))?.body||null}
export async function databaseHealthy(){if(backend()==='supabase')return (await call('health',{})).ok===true;await runtime().DB.prepare('SELECT 1').first();return true}
export async function activeAuthSession(sessionId:string,userId:string){if(backend()!=='supabase')return false;return await call('auth-session',{sessionId,userId})===true}


// Account creation is private to the store bridge. The service key never reaches the Site or browser.
export async function registerPasswordCustomer(email: string, password: string) {
  const result = await call('register-password-customer', {email, password});
  if (result?.outcome === 'created') return;
  if (result?.outcome === 'taken') throw new HttpError(409, 'An account already uses this email. Sign in with your password.');
  if (result?.outcome === 'weak') throw new HttpError(400, 'Choose a stronger password and try again.');
  if (result?.outcome === 'invalid') throw new HttpError(400, 'Check your email address and password.');
  if (result?.outcome === 'limited') throw new HttpError(429, 'Please wait before trying again.');
  throw new HttpError(503, 'Account creation is temporarily unavailable. Please try again.');
}

export async function saveCatalogueProduct(previous:RecordRow|null,data:{id:string;[key:string]:any}):Promise<{ok:boolean;reason?:string}>{
 if(backend()!=='supabase')throw Error('Product variations require the configured Supabase backend.');
 return await call('catalogue-save',{id:data.id,previous:previous?.data||null,data});
}
