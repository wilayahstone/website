import {countryCurrencies} from './currency-regions';
// Country selection requests a delivery assessment; it does not promise a shipping route.
const excluded=new Set(['AC','CP','DG','EA','EU','IC','TA','XK']);
const names=new Intl.DisplayNames(['en'],{type:'region'});
export const destinations=Object.keys(countryCurrencies).filter(code=>/^[A-Z]{2}$/.test(code)&&!excluded.has(code)).map(code=>({code,name:names.of(code)||code})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
export function destinationName(value:string){return destinations.find(d=>d.code===value||d.name===value)?.name||null}
