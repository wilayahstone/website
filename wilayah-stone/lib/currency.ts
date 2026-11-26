import {currencyChoices} from './currency-regions';
export {currencyChoices} from './currency-regions';
export type Currency=typeof currencyChoices[number];
export function isCurrency(s:string):s is Currency{return (currencyChoices as readonly string[]).includes(s)}
export function currencyDigits(currency:Currency){return currency==='PKR'?2:new Intl.NumberFormat('en',{style:'currency',currency}).resolvedOptions().maximumFractionDigits||0}
export function convertAmount(pkr:number|null,rate:number,currency:Currency='PKR'):number|null{if(pkr===null)return null;if(!Number.isFinite(pkr)||pkr<0||!Number.isFinite(rate)||rate<=0)throw Error('Invalid currency calculation');const factor=10**currencyDigits(currency);return Math.round((pkr*rate+Number.EPSILON)*factor)/factor;}
export function money(v:number,currency:Currency){return new Intl.NumberFormat('en',{style:'currency',currency,currencyDisplay:'code',minimumFractionDigits:currencyDigits(currency),maximumFractionDigits:currencyDigits(currency)}).format(v);}
