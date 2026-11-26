import {requireStoreAdmin} from '../../../../lib/server/admin-context';
import {companyMailbox,activeMailConfig} from '../../../../lib/server/private-mail';
import {can} from '../../../../lib/server/access';
import {insertRecord,consumeRate} from '../../../../lib/server/data';
import {emailHash} from '../../../../lib/server/email-sessions';
import {HttpError,json,requireSameOrigin} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 requireSameOrigin(req);const ctx=await requireStoreAdmin(req);if(!can(ctx.staff.role,'settings.write'))throw new HttpError(403,'Store settings access is required.');if(new URL(req.url).origin!==ctx.auth.config.site)throw new HttpError(403,'Open the official store workspace.');
 const config=await activeMailConfig();if(!config.GMAIL_CLIENT_ID||!config.GMAIL_CLIENT_SECRET)throw new HttpError(409,'Save your Google client settings in Email delivery first.');if(!await consumeRate('mail-connect:'+ctx.staff.user.userId,10))throw new HttpError(429,'Please wait before connecting again.');
 const state=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join(''),id='mail-connect:'+await emailHash(state);
 if(!await insertRecord(id,'setting','auth:mail',{sessionId:ctx.verified.sessionId,clientId:config.GMAIL_CLIENT_ID,createdAt:Date.now(),expiresAt:Date.now()+600000,status:'pending'}))throw Error('Connection unavailable');
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:config.GMAIL_CLIENT_ID,redirect_uri:ctx.auth.config.site+'/auth/mail/callback',response_type:'code',scope:'openid email https://www.googleapis.com/auth/gmail.send',access_type:'offline',prompt:'consent',state,login_hint:companyMailbox()}).toString();
 const cookie='__Host-ws-mail-state='+state+'; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax';return ctx.auth.finish(req.headers.get('accept')==='application/json'?json({redirect:url.href},200,{'Set-Cookie':cookie}):new Response(null,{status:303,headers:{Location:url.href,'Set-Cookie':cookie}}));
 }catch(e){return json({error:e instanceof HttpError?e.message:'The Gmail connection could not be started.'},e instanceof HttpError?e.status:503)}}
