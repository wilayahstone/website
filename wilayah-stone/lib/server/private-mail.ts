import {runtime,type StoreRuntime} from './runtime';
import {getRecord,insertRecord,compareAndSet,type RecordRow} from './data';
const id='mail:credentials',owner='auth:mail';
type Credentials={GMAIL_CLIENT_ID?:string;GMAIL_CLIENT_SECRET?:string;GMAIL_REFRESH_TOKEN?:string;EMAIL_OTP_PROVIDER?:string;EMAIL_OTP_FROM?:string;EMAIL_OTP_REPLY_TO?:string;RESEND_API_KEY?:string};
function bytes(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0))}
function base64(value:Uint8Array){return btoa(String.fromCharCode(...value))}
async function key(){const secret=runtime().EMAIL_OTP_SECRET;if(!secret||secret.length<64)throw Error('Email configuration unavailable');return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode('store-mail-v1:'+secret)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function loadMailCredentials(){const record=await getRecord(id,'setting');let credentials:Credentials={};if(record){if(record.owner!==owner||record.data.version!==1)throw Error('Email configuration unavailable');const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(record.data.iv),additionalData:new TextEncoder().encode(id)},await key(),bytes(record.data.sealed));const data=JSON.parse(new TextDecoder().decode(clear));for(const name of ['GMAIL_CLIENT_ID','GMAIL_CLIENT_SECRET','GMAIL_REFRESH_TOKEN','EMAIL_OTP_PROVIDER','EMAIL_OTP_FROM','EMAIL_OTP_REPLY_TO','RESEND_API_KEY'] as const)if(typeof data[name]==='string')credentials[name]=data[name]}
 return {record,credentials};}
export async function activeMailConfig():Promise<StoreRuntime>{const {credentials}=await loadMailCredentials();return {...runtime(),...credentials}}
export async function saveMailCredentials(credentials:Credentials,previous:RecordRow|null){const iv=crypto.getRandomValues(new Uint8Array(12)),sealed=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(id)},await key(),new TextEncoder().encode(JSON.stringify(credentials)))),data={version:1,iv:base64(iv),sealed:base64(sealed)};if(previous?!await compareAndSet(previous,data):!await insertRecord(id,'setting',owner,data))throw Error('Email configuration changed. Refresh and try again.')}

export function companyMailbox(){const env=runtime(),from=env.EMAIL_OTP_FROM?.match(/<([^<>]+)>$/)?.[1]||env.EMAIL_OTP_FROM;return env.EMAIL_OTP_REPLY_TO||(/@gmail\.com$/i.test(from||'')?from:env.ADMIN_BOOTSTRAP_EMAIL)||''}
