import {z} from 'zod';
import {runtime} from './runtime';
import {getRecord,insertRecord,compareAndSet} from './data';
import {HttpError} from '../http';
import {ADMIN_COOKIE,ATTEMPT_COOKIE} from '../admin-auth-policy';
import {CUSTOMER_COOKIE,CUSTOMER_ATTEMPT,CUSTOMER_RETURN} from '../customer-auth-policy';
import type {StaffIdentity} from '../admin-auth-policy';
import {accountMailConfigured,sendAccountMail} from './account-mail';
import {activeMailConfig} from './private-mail';
import {httpsOrigin} from '../site';

export type Scope='customer'|'admin';
const tokenPattern=/^[a-f0-9]{64}$/;
const uuidPattern=/^[a-f0-9-]{36}$/i;
const sessionOwner='auth:sessions',challengeOwner='auth:challenges',userOwner='auth:directory';
export async function emailHash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('')}
function otp(){let value:number;const limit=Math.floor(4294967296/1000000)*1000000;do{value=crypto.getRandomValues(new Uint32Array(1))[0]}while(value>=limit);return String(value%1000000).padStart(6,'0')}
function equals(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export function emailSite(request?:Request){const env=runtime(),primary=httpsOrigin(env.ADMIN_AUTH_ORIGIN);if(!primary)return null;const allowed=new Set([primary,...(env.ADMIN_AUTH_ALLOWED_ORIGINS||'').split(',').map(v=>httpsOrigin(v.trim())).filter((v):v is string=>!!v)]);if(request){const origin=new URL(request.url).origin;return allowed.has(origin)?{site:origin}:null}return {site:primary}}
function matchingOrigin(auth:EmailAuth,data:any){return data.origin?data.origin===auth.config.site:auth.config.site===emailSite()?.site}
export async function emailDelivery(){return !!emailSite()&&(runtime().EMAIL_OTP_SECRET||'').length>=64&&accountMailConfigured(await activeMailConfig())}
export function sharedAdminMode(){return runtime().ADMIN_ACCESS_MODE==='shared_code'}
export function sharedAdminConfigured(){const env=runtime();return sharedAdminMode()&&!!emailSite()&&/^\d{6}$/.test(env.ADMIN_SHARED_CODE||'')&&(env.EMAIL_OTP_SECRET||'').length>=64&&z.string().email().safeParse(env.ADMIN_BOOTSTRAP_EMAIL).success}
export function createEmailAuth(req:Request,scope:Scope){
 const config=emailSite(req);if(!config)throw new HttpError(emailSite()?403:503,'Open your account at the official store address.');
 const name=scope==='admin'?ADMIN_COOKIE:CUSTOMER_COOKIE,attempt=scope==='admin'?ATTEMPT_COOKIE:CUSTOMER_ATTEMPT;
 const allowed=(n:string)=>n===name||n.startsWith(name+'.')||n===name+'-code-verifier'||n===attempt||scope==='customer'&&n===CUSTOMER_RETURN;
 const jar=new Map<string,string>(),changes=new Map<string,{value:string;maxAge:number}>();
 for(const part of (req.headers.get('cookie')||'').split(';')){const split=part.indexOf('=');if(split<0)continue;const n=part.slice(0,split).trim();if(allowed(n))try{jar.set(n,decodeURIComponent(part.slice(split+1).trim()))}catch{}}
 function set(n:string,value:string,options:{maxAge?:number}={}){if(!allowed(n))throw Error('Invalid session cookie');jar.set(n,value);changes.set(n,{value,maxAge:Math.max(0,Math.min(options.maxAge??28800,28800))})}
 function clear(){for(const n of new Set([...jar.keys(),name,attempt,...(scope==='customer'?[CUSTOMER_RETURN]:[])]))set(n,'',{maxAge:0})}
 function finish(response:Response){const headers=new Headers(response.headers);for(const [n,c] of changes)headers.append('Set-Cookie',`${n}=${encodeURIComponent(c.value)}; Path=/; Max-Age=${c.maxAge}; HttpOnly; Secure; SameSite=Lax`);headers.set('Cache-Control','private, no-store');headers.set('X-Robots-Tag','noindex, nofollow');headers.set('Referrer-Policy','no-referrer');return new Response(response.body,{status:response.status,headers})}
 return {config,scope,name,attempt,set,clear,finish,cookies:()=>Array.from(jar,([name,value])=>({name,value})),cookie:(n:string)=>jar.get(n),get hasSession(){return tokenPattern.test(jar.get(name)||'')}};
}
export type EmailAuth=ReturnType<typeof createEmailAuth>;
async function codeHash(scope:Scope,email:string,challenge:string,code:string){const secret=runtime().EMAIL_OTP_SECRET;if(!secret||secret.length<64)throw Error('Email access unavailable');const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(scope+'\n'+email+'\n'+challenge+'\n'+code))),v=>v.toString(16).padStart(2,'0')).join('')}
async function cooldown(scope:Scope,email:string){const id='email-cooldown:'+scope+':'+await emailHash(email),now=Date.now();for(let i=0;i<4;i++){const previous=await getRecord(id,'setting');if(!previous){if(await insertRecord(id,'setting',challengeOwner,{lastSent:now}))return;continue}if(now-Number(previous.data.lastSent)<60000)throw new HttpError(429,'Please wait one minute before requesting another code.');if(await compareAndSet(previous,{lastSent:now}))return}throw new HttpError(429,'Please wait before requesting another code.')}
export async function sendEmailCode(auth:EmailAuth,email:string){
 if(!await emailDelivery())throw new HttpError(503,'We couldn’t send your code. Please try again later or message the atelier on WhatsApp.');
 await cooldown(auth.scope,email);const challenge=token(),id='email-challenge:'+await emailHash(challenge),code=otp(),now=Date.now();
 const data={email,scope:auth.scope,origin:auth.config.site,codeHash:await codeHash(auth.scope,email,challenge,code),createdAt:now,expiresAt:now+300000,attempts:0,status:'pending'};
 if(!await insertRecord(id,'setting',challengeOwner,data))throw Error('Please request another code');
 try{const body={to:email,id,subject:'Your Wilayah Stone one-time code',text:`Your ${auth.scope==='admin'?'store workspace':'Wilayah Stone account'} code is ${code}.\n\nThis code expires in 5 minutes. Enter it only on the Wilayah Stone website where you requested it. The atelier will never ask you to share your code.\n\nIf you did not request this email, you can ignore it.`,html:`<div style="font-family:Arial,sans-serif;color:#083d2e;max-width:480px;margin:32px auto;padding:24px;border:1px solid #e5e6de"><h2>Wilayah Stone</h2><p>Your ${auth.scope==='admin'?'store workspace':'account'} one-time code</p><p style="font-size:32px;letter-spacing:8px;font-weight:bold">${code}</p><p>This code expires in 5 minutes. Enter it only on the Wilayah Stone website where you requested it. The atelier will never ask you to share your code.</p><p style="color:#727b6d;font-size:12px">If you did not request this email, you can ignore it.</p></div>`};
  await sendAccountMail(body);
  const row=await getRecord(id,'setting');if(!row||!await compareAndSet(row,{...data,status:'sent'}))throw Error('Please request a new code');
  const old=auth.cookie(auth.attempt);if(old&&tokenPattern.test(old)){const prior=await getRecord('email-challenge:'+await emailHash(old),'setting');if(prior&&prior.owner===challengeOwner&&prior.data.scope===auth.scope)await compareAndSet(prior,{...prior.data,status:'replaced'})}
  auth.set(auth.attempt,challenge,{maxAge:300});
 }catch{const row=await getRecord(id,'setting');if(row)await compareAndSet(row,{...row.data,status:'failed'});throw new HttpError(503,'We couldn’t send your code. Please try again later or message the atelier on WhatsApp.')}
}
export async function verifyEmailCode(auth:EmailAuth,email:string,code:string){
 const challenge=auth.cookie(auth.attempt),failure=()=>new HttpError(400,'That code is invalid or has expired. Request a new code to continue.');if(!challenge||!tokenPattern.test(challenge)||!/^\d{6}$/.test(code))throw failure();
 const id='email-challenge:'+await emailHash(challenge),expected=await codeHash(auth.scope,email,challenge,code);
 for(let i=0;i<5;i++){const row=await getRecord(id,'setting'),data=row?.data;if(!row||row.owner!==challengeOwner||data.scope!==auth.scope||!matchingOrigin(auth,data)||data.email!==email||data.status!=='sent'||data.attempts>=5||data.createdAt>Date.now()+1000||data.expiresAt<=Date.now()||data.expiresAt-data.createdAt>300000)throw failure();
  const correct=typeof data.codeHash==='string'&&equals(data.codeHash,expected),next={...data,attempts:data.attempts+1,status:correct?'used':data.attempts>=4?'locked':'sent'};if(!await compareAndSet(row,next))continue;if(!correct)throw failure();
  const userKey='email-user:'+await emailHash(email);let account=await getRecord(userKey,'setting');if(!account){await insertRecord(userKey,'setting',userOwner,{id:crypto.randomUUID(),email,createdAt:Date.now(),verifiedAt:Date.now()});account=await getRecord(userKey,'setting')}if(!account||account.owner!==userOwner||account.data.email!==email||!uuidPattern.test(account.data.id)||account.data.disabledAt)throw new HttpError(403,'Please contact the atelier about this account.');
  await revokeEmailSession(auth);const sessionToken=token(),sessionId=crypto.randomUUID(),sessionKey='email-session:'+await emailHash(sessionToken),now=Date.now();if(!await insertRecord(sessionKey,'setting',sessionOwner,{id:sessionId,userId:account.data.id,email,scope:auth.scope,origin:auth.config.site,createdAt:now,expiresAt:now+28800000}))throw Error('Account access unavailable');auth.clear();auth.set(auth.name,sessionToken,{maxAge:28800});return;
 }throw failure();
}
export async function createSharedAdminSession(auth:EmailAuth,code:string){
 if(auth.scope!=='admin'||!sharedAdminConfigured())throw new HttpError(503,'Store access is temporarily unavailable. Please try again.');
 const expected=await codeHash('admin','','store-access',runtime().ADMIN_SHARED_CODE!),actual=await codeHash('admin','','store-access',code);
 if(!equals(actual,expected))throw new HttpError(400,'That access code is incorrect. Please try again.');
 let account=await getRecord('store-admin:identity','setting');if(!account){await insertRecord('store-admin:identity','setting',userOwner,{id:crypto.randomUUID(),createdAt:Date.now()});account=await getRecord('store-admin:identity','setting')}
 if(!account||account.owner!==userOwner||!uuidPattern.test(account.data.id)||account.data.disabledAt)throw new HttpError(403,'Store access is unavailable.');
 await revokeEmailSession(auth);const value=token(),now=Date.now(),key='email-session:'+await emailHash(value);
 if(!await insertRecord(key,'setting',sessionOwner,{id:crypto.randomUUID(),userId:account.data.id,email:runtime().ADMIN_BOOTSTRAP_EMAIL,scope:'admin',origin:auth.config.site,method:'shared_code',codeVersion:await codeHash('admin','','store-access-version',runtime().ADMIN_SHARED_CODE!),createdAt:now,expiresAt:now+28800000}))throw Error('Store access unavailable');
 auth.clear();auth.set(auth.name,value,{maxAge:28800});
}
export async function verifiedEmailSession(auth:EmailAuth):Promise<{user:StaffIdentity;sessionId:string}|null>{
 const value=auth.cookie(auth.name);if(!value||!tokenPattern.test(value))return null;const row=await getRecord('email-session:'+await emailHash(value),'setting'),data=row?.data,now=Date.now();if(!row||row.owner!==sessionOwner||data.scope!==auth.scope||!matchingOrigin(auth,data)||data.revokedAt||!uuidPattern.test(data.id)||!uuidPattern.test(data.userId)||!z.string().email().safeParse(data.email).success||!Number.isSafeInteger(data.createdAt)||!Number.isSafeInteger(data.expiresAt)||data.createdAt>now+1000||data.expiresAt<=now||data.expiresAt-data.createdAt>28800000||now-data.createdAt>28800000)return null;
 if(data.method==='shared_code'){
  if(auth.scope!=='admin'||!sharedAdminConfigured()||!equals(String(data.codeVersion||''),await codeHash('admin','','store-access-version',runtime().ADMIN_SHARED_CODE!)))return null;
  const account=await getRecord('store-admin:identity','setting');if(!account||account.owner!==userOwner||account.data.disabledAt||account.data.id!==data.userId)return null;
  return {user:{userId:'store-admin:'+data.userId,email:data.email,displayName:'Store administrator',fullName:null,authProvider:'shared_code'},sessionId:data.id};
 }
 if(auth.scope==='admin'&&sharedAdminMode())return null;
 if(data.method==='google')return null;
 const account=await getRecord('email-user:'+await emailHash(data.email),'setting');if(!account||account.owner!==userOwner||account.data.disabledAt||account.data.id!==data.userId||account.data.email!==data.email)return null;
 return {user:{userId:(auth.scope==='admin'?'email:':'customer:')+data.userId,email:data.email,displayName:data.email,fullName:null,...(auth.scope==='admin'?{authProvider:'email' as const}:{})},sessionId:data.id};
}
export async function revokeEmailSession(auth:EmailAuth){const value=auth.cookie(auth.name);if(value&&tokenPattern.test(value)){for(let i=0;i<4;i++){const row=await getRecord('email-session:'+await emailHash(value),'setting');if(!row||row.owner!==sessionOwner||row.data.scope!==auth.scope||!matchingOrigin(auth,row.data)||row.data.revokedAt)return;if(await compareAndSet(row,{...row.data,revokedAt:Date.now()}))return}throw Error('Please try signing out again')} }
