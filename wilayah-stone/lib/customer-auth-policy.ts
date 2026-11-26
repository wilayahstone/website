export const CUSTOMER_COOKIE='__Host-ws-customer-auth';
export const CUSTOMER_ATTEMPT='__Host-ws-customer-attempt';
export const CUSTOMER_RETURN='__Host-ws-customer-return';
export function customerReturn(value:unknown){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\x00-\x20]/.test(value))return '/account';
 try{const u=new URL(value,'https://store.local');if(u.origin!=='https://store.local'||!/^\/(account|help|bag|wishlist|collection|personalisation|product\/[A-Za-z0-9-]+)$/.test(u.pathname))return '/account';return u.pathname+u.search}catch{return '/account'}
}
