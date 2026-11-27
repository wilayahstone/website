import {parse as parseColor,formatHex,formatRgb,formatCss} from 'culori';
/** Allowlisted product content. Never interpret stored description text as HTML. */
export const DESCRIPTION_TEXT_LIMIT=12000;
export const DESCRIPTION_IMAGE_LIMIT=8;
export const descriptionFontSizes=['14px','16px','18px','20px','24px','28px','32px'] as const;
export type DescriptionMark={type:'bold'|'italic'|'underline'|'link'|'textStyle';attrs?:Record<string,string>};
export type DescriptionNode={type:string;text?:string;attrs?:Record<string,string|number|null>;marks?:DescriptionMark[];content?:DescriptionNode[]};
export type ProductDescription={type:'doc';content:DescriptionNode[]};
const mediaPath=/^\/api\/media\/([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
export function descriptionMediaId(src:unknown){return typeof src==='string'?mediaPath.exec(src)?.[1].toLowerCase()||null:null}
export function safeDescriptionLink(value:unknown):string|null{
 if(typeof value!=='string')return null;const href=value.trim();if(!href||href.length>2048||/[\s\u0000-\u001f\u007f\\]/u.test(href))return null;
 if(/^\/(?!\/)/.test(href)||/^#[\w-]+$/.test(href))return href;
 try{const url=new URL(href);return ['http:','https:','mailto:','tel:'].includes(url.protocol)&&!url.username&&!url.password?href:null}catch{return null}
}
export function descriptionColor(value:unknown){
 if(typeof value!=='string')return null;const colour=value.trim().toLowerCase();if(!colour||colour.length>256||/[;{}<>\\"']/u.test(colour))return null;
 // These CSS keywords often arrive in pasted Word documents and use the reader’s system palette.
 const keywords=['inherit','initial','unset','revert','revert-layer','currentcolor','activetext','buttonborder','buttonface','buttontext','canvas','canvastext','field','fieldtext','graytext','highlight','highlighttext','linktext','mark','marktext','selecteditem','selecteditemtext','visitedtext','activeborder','activecaption','appworkspace','background','buttonhighlight','buttonshadow','captiontext','inactiveborder','inactivecaption','inactivecaptiontext','infobackground','infotext','menu','menutext','scrollbar','threeddarkshadow','threedface','threedhighlight','threedlightshadow','threedshadow','window','windowframe','windowtext'];
 if(keywords.includes(colour))return colour;
 try{const parsed=parseColor(colour);if(!parsed||Object.values(parsed).some(channel=>typeof channel==='number'&&!Number.isFinite(channel)))return null;return parsed.mode==='rgb'?(parsed.alpha===undefined||parsed.alpha===1?formatHex(parsed):formatRgb(parsed)):formatCss(parsed)}catch{return null}
}
export function descriptionPickerColor(value:unknown){const colour=descriptionColor(value);try{return colour?formatHex(colour)||'#153f35':'#153f35'}catch{return '#153f35'}}
export function parseProductDescription(input:unknown):ProductDescription{
 const fail=(message='Choose supported description formatting.')=>{throw Error(message)};
 if(!input||typeof input!=='object')return fail();
 let serialized:string;try{serialized=JSON.stringify(input)}catch{return fail()}
 if(new TextEncoder().encode(serialized).length>48000)return fail('Keep the formatted description under 48 KB.');
 let count=0,images=0;
 function node(value:any,parent:string,depth:number):DescriptionNode{
  if(!value||typeof value!=='object'||Array.isArray(value)||++count>600||depth>12)return fail('Simplify the description’s length or nesting.');
  const type=value.type,inline=['text','hardBreak'];
  const allowed=parent==='doc'?['paragraph','heading','bulletList','orderedList','image']:['paragraph','heading'].includes(parent)?inline:parent==='listItem'?['paragraph','heading','bulletList','orderedList','image']:['bulletList','orderedList'].includes(parent)?['listItem']:[];
  if(!allowed.includes(type))return fail();
  if(type==='text'){
   if(typeof value.text!=='string'||!value.text||value.text.length>DESCRIPTION_TEXT_LIMIT)return fail('Enter a description of up to 12,000 characters.');
   const marks:DescriptionMark[]=[];if(value.marks!==undefined&&!Array.isArray(value.marks))return fail();
   for(const mark of value.marks||[]){if(!mark||marks.some(m=>m.type===mark.type))return fail();
    if(['bold','italic','underline'].includes(mark.type))marks.push({type:mark.type});
    else if(mark.type==='link'){const href=safeDescriptionLink(mark.attrs?.href);if(!href)return fail('Use a valid website, email, telephone or internal link.');marks.push({type:'link',attrs:{href}})}
    else if(mark.type==='textStyle'){
     const attrs:Record<string,string>={};if(mark.attrs?.color!=null){const c=descriptionColor(mark.attrs.color);if(!c)return fail('Choose a valid text colour.');attrs.color=c}
     if(mark.attrs?.fontSize!=null){if(!descriptionFontSizes.includes(mark.attrs.fontSize))return fail('Choose a font size from the editor.');attrs.fontSize=mark.attrs.fontSize}
     if(Object.keys(attrs).length)marks.push({type:'textStyle',attrs});
    }else return fail();
   }
   marks.sort((a,b)=>a.type.localeCompare(b.type));return {type,text:value.text,...(marks.length?{marks}:{})};
  }
  if(type==='hardBreak')return {type};
  if(type==='image'){
   const id=descriptionMediaId(value.attrs?.src),alt=typeof value.attrs?.alt==='string'?value.attrs.alt.trim():'';
   if(!id||alt.length<5||alt.length>200)return fail('Upload each description image and add a description of 5–200 characters.');
   if(++images>DESCRIPTION_IMAGE_LIMIT)return fail('Use up to eight images in one description.');
   const caption=value.attrs?.caption??'';if(typeof caption!=='string'||caption.length>300)return fail('Keep image captions under 300 characters.');
   return {type,attrs:{src:'/api/media/'+id,alt,caption:caption.trim()}};
  }
  const attrs:Record<string,string|number|null>={};if(type==='heading'){if(![2,3,4].includes(value.attrs?.level))return fail('Use heading levels 2, 3 or 4.');attrs.level=value.attrs.level}
  if(['paragraph','heading'].includes(type)){
   if(value.attrs?.textAlign!=null){if(!['left','center','right'].includes(value.attrs.textAlign))return fail();attrs.textAlign=value.attrs.textAlign}
   if(value.attrs?.paragraphSpacing!=null){if(!['compact','normal','relaxed'].includes(value.attrs.paragraphSpacing))return fail();attrs.paragraphSpacing=value.attrs.paragraphSpacing}
  }
  if(type==='orderedList'&&value.attrs?.start!=null){if(!Number.isInteger(value.attrs.start)||value.attrs.start<1||value.attrs.start>999)return fail();attrs.start=value.attrs.start}
  if(value.content!==undefined&&!Array.isArray(value.content))return fail();
  const content=(value.content||[]).map((child:any)=>node(child,type,depth+1));
  if(['bulletList','orderedList','listItem'].includes(type)&&(!content.length||type==='listItem'&&content[0].type!=='paragraph'))return fail();
  return {type,...(Object.keys(attrs).length?{attrs}:{}),...(content.length?{content}:{})};
 }
 const value=input as any;if(value.type!=='doc'||!Array.isArray(value.content)||!value.content.length)return fail();
 const doc:ProductDescription={type:'doc',content:value.content.map((child:any)=>node(child,'doc',1))};
 if(descriptionText(doc).length>DESCRIPTION_TEXT_LIMIT)return fail('Keep the description under 12,000 characters.');return doc;
}
export function descriptionText(doc:ProductDescription):string{
 function text(node:DescriptionNode):string{if(node.type==='text')return node.text||'';if(node.type==='hardBreak')return '\n';if(node.type==='image')return '';const parts=(node.content||[]).map(text);return parts.join(['paragraph','heading'].includes(node.type)?'':'\n\n')}
 return text(doc).replace(/\n{3,}/g,'\n\n').trim();
}
export function descriptionImageIds(doc:ProductDescription|null|undefined):string[]{const ids=new Set<string>();function visit(node:DescriptionNode){if(node.type==='image'){const id=descriptionMediaId(node.attrs?.src);if(id)ids.add(id)}node.content?.forEach(visit)}if(doc)visit(doc);return [...ids]}
export function descriptionImageCount(doc:ProductDescription):number{const visit=(node:DescriptionNode):number=>(node.type==='image'?1:0)+(node.content||[]).reduce((sum,child)=>sum+visit(child),0);return visit(doc)}
export function plainDescriptionDocument(text:string):ProductDescription{return {type:'doc',content:text.split(/\r?\n\s*\r?\n/).map(paragraph=>({type:'paragraph',...(paragraph?{content:paragraph.split(/\r?\n/).flatMap((line,index):DescriptionNode[]=>[...(index?[{type:'hardBreak'} as DescriptionNode]:[]),...(line?[{type:'text',text:line,marks:[{type:'textStyle',attrs:{color:'#153f35',fontSize:'16px'}}]} as DescriptionNode]:[])])}:{})}))}}
export function readProductDescription(value:unknown):ProductDescription|null{if(!value)return null;try{return parseProductDescription(value)}catch{return null}}
