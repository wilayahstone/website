export const customSiteOrigin='https://wilayahstone.publicvm.com';
export const legacySiteOrigin='https://wilayah-stone.raza-4920618957.chatgpt.site';
export const storeSiteOrigins=[customSiteOrigin,legacySiteOrigin] as const;
export function httpsOrigin(value:unknown){if(typeof value!=='string')return null;try{const url=new URL(value);return url.protocol==='https:'&&url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password?url.origin:null}catch{return null}}
