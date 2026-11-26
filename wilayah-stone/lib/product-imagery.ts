import type {Product} from './catalog';

export const ringImageCaption='Design render. Your ring is individually made to the stone, size and engraving agreed with the atelier.';

export function productImage(product:Pick<Product,'id'|'stone'|'engraving'|'imageIds'>,view:0|1=0){
 const custom=product.imageIds?.[view]||product.imageIds?.[0];if(custom)return {src:'/api/media/'+custom,srcSet:'/api/media/'+custom+' 960w',alt:`${product.stone} silver ring${product.engraving==='Plain'?'':` with ${product.engraving} engraving`} — ${view===1?'detail':'front'} view`};
 const file=product.id.toLowerCase()+(view===1?'-detail':'')+(['WS-105','WS-205','WS-305','WS-207'].includes(product.id)?'-v2':'');
 return {
  src:`/assets/products/${file}-960.webp`,
  srcSet:`/assets/products/${file}-480.webp 480w, /assets/products/${file}-960.webp 960w`,
  alt:`${product.stone} silver ring${product.engraving==='Plain'?' with a plain stone':` with ${product.engraving} name engraving`} — ${view===1?'detail':'front'} view render`,
 };
}

export function productGallery(product:Pick<Product,'id'|'stone'|'engraving'|'imageIds'>){return [productImage(product,0),productImage(product,1)];}
