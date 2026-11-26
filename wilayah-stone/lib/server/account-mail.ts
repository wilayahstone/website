import {z} from 'zod';
import {runtime,type StoreRuntime} from './runtime';
import {activeMailConfig} from './private-mail';
type AccountMail={to:string;subject:string;text:string;html:string;id:string};
function address(value:string){return value.match(/<([^<>]+)>$/)?.[1]||value}
function validMailbox(value:string){return value.length<=200&&!/[\r\n]/.test(value)&&z.string().email().safeParse(address(value)).success}
export function accountMailConfigured(env:StoreRuntime=runtime()){
 const from=env.EMAIL_OTP_FROM||'';
 if(!validMailbox(from))return false;
 if(env.EMAIL_OTP_PROVIDER==='gmail')return !!env.GMAIL_CLIENT_ID&&!!env.GMAIL_CLIENT_SECRET&&!!env.GMAIL_REFRESH_TOKEN&&/@gmail\.com$/i.test(address(from));
 if(env.EMAIL_OTP_PROVIDER&&env.EMAIL_OTP_PROVIDER!=='resend')return false;
 // Resend cannot authorize public Gmail addresses as sending domains.
 return !!env.RESEND_API_KEY&&!/@(?:gmail|googlemail)\.com$/i.test(address(from));
}
function base64(value:string){const bytes=new TextEncoder().encode(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary)}
function mimeBase64(value:string){return base64(value).match(/.{1,76}/g)?.join('\r\n')||''}
export class MailDeliveryError extends Error{constructor(public reason:'credentials'|'sender'|'quota'|'provider'){super('Email delivery refused')}}
export async function sendAccountMail(mail:AccountMail,override?:StoreRuntime){
 const env=override||await activeMailConfig();
 if(!accountMailConfigured(env)||!validMailbox(mail.to)||/[\r\n]/.test(mail.subject))throw Error('Email delivery unavailable');
 const replyTo=env.EMAIL_OTP_REPLY_TO&&validMailbox(env.EMAIL_OTP_REPLY_TO)?env.EMAIL_OTP_REPLY_TO:undefined;
 if(env.EMAIL_OTP_PROVIDER==='gmail'){
  // Authorization is for the store's outgoing mailbox only, never customer sign-in.
  const exchange=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GMAIL_CLIENT_ID!,client_secret:env.GMAIL_CLIENT_SECRET!,refresh_token:env.GMAIL_REFRESH_TOKEN!,grant_type:'refresh_token'}),redirect:'manual',signal:AbortSignal.timeout(10000)});
  const token:any=await exchange.json().catch(()=>null);if(!exchange.ok||token?.token_type?.toLowerCase()!=='bearer'||typeof token?.access_token!=='string'||!token.access_token)throw Error('Email authorization unavailable');
  const boundary='ws-'+crypto.randomUUID(),sender=address(env.EMAIL_OTP_FROM!),lines=[`From: Wilayah Stone <${sender}>`,`To: ${mail.to}`,`Subject: ${mail.subject}`,`Date: ${new Date().toUTCString()}`,`Message-ID: <${mail.id.replace(/[^a-zA-Z0-9-]/g,'')}@gmail.com>`,'MIME-Version: 1.0',...(replyTo?[`Reply-To: ${replyTo}`]:[]),`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',mimeBase64(mail.text),`--${boundary}`,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',mimeBase64(mail.html),`--${boundary}--`,''];
  const raw=base64(lines.join('\r\n')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/'+encodeURIComponent(sender)+'/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},body:JSON.stringify({raw}),redirect:'manual',signal:AbortSignal.timeout(15000)});
  const sent:any=await response.json().catch(()=>null);if(!response.ok||!sent?.id)throw Error('Email delivery refused');return;
 }
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':mail.id},body:JSON.stringify({from:env.EMAIL_OTP_FROM,...(replyTo?{reply_to:replyTo}:{}),to:[mail.to],subject:mail.subject,text:mail.text,html:mail.html}),redirect:'manual',signal:AbortSignal.timeout(15000)});
 const sent:any=await response.json().catch(()=>null);if(!response.ok||!sent?.id)throw new MailDeliveryError(response.status===401?'credentials':response.status===403?'sender':response.status===429?'quota':'provider');
}
