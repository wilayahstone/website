import type {Product} from './catalog';
import {stoneProfiles} from './product-content';
export function normaliseSearch(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f\u064b-\u065f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
const alternativeNames:Record<string,string[]>={
 'Imam Ali':['imam ali','ameer al momineen'], 'Imam Hasan':['hassan'], 'Imam Husayn':['hussain','hussein','husain'],
 'Imam Zayn al-Abidin':['zain ul abideen','zain al abidin','sajjad'], 'Imam Muhammad al-Baqir':['baqer'],
 'Imam Jafar al-Sadiq':['jafar sadiq','jaffer','sadiq'], 'Imam Musa al-Kadhim':['kazem','kazim','kadhim','kadhum'],
 'Imam Ali al-Rida':['reza','ridha','raza'], 'Imam Muhammad al-Jawad':['taqi','jawad'],
 'Imam Ali al-Hadi':['naqi','hadi'], 'Imam Hasan al-Askari':['hassan askari'], 'Imam Muhammad al-Mahdi':['mehdi','mahdi']
};
export function matchesSearch(p:Product,query:string){const terms=normaliseSearch(query).split(' ').filter(Boolean);if(!terms.length)return true;const index=normaliseSearch([p.id,p.sku||p.id,p.name,p.stone,p.engraving,p.metal,p.description,...(p.attributes||[]).flatMap(attribute=>[attribute.name,...attribute.values]),...(p.variationOptions||[]).flatMap(option=>[option.name,...option.values]),...(p.variations||[]).map(variation=>variation.sku),...(stoneProfiles[p.stone]?.aliases||[]),...(alternativeNames[p.engraving.replace(/ \(AS\)$/,'')]||[])].join(' '));return terms.every(t=>index.includes(t));}
export function validWishlist(value:unknown,ids:string[]){return Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string'&&ids.includes(v)))].slice(0,100):[];}
