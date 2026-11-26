import {countryCurrencies} from './currency-regions';
import {Currency,isCurrency} from './currency';
export function normaliseCountry(value:unknown):string|null{if(typeof value!=='string')return null;const country=value.trim().toUpperCase();return /^[A-Z]{2}$/.test(country)&&!!countryCurrencies[country]?country:null}
export function currencyForCountry(value:unknown):Currency{const country=normaliseCountry(value);const currency=country?countryCurrencies[country]:undefined;return currency&&isCurrency(currency)?currency:'PKR'}
export function locationPreference(request:Request){
 const cf=(request as Request&{cf?:{country?:unknown}}).cf;
 const country=normaliseCountry(cf?.country)||normaliseCountry(request.headers.get('cf-ipcountry'));
 return {country,currency:currencyForCountry(country),source:country?'country':'fallback'};
}
export function locationResponse(request:Request){
 const headers={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff'};
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405,headers:{...headers,Allow:'GET, HEAD'}});
 return new Response(request.method==='HEAD'?null:JSON.stringify(locationPreference(request)),{headers});
}
