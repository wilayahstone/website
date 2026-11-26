import {Fragment,type ReactNode,type CSSProperties} from 'react';
import {readProductDescription,plainDescriptionDocument,type DescriptionNode} from '../../lib/product-description';
import {respectfulText} from '../../lib/imams';
export function ProductDescription({description,richText}:{description:string;richText?:unknown}){
 const doc=readProductDescription(richText)||plainDescriptionDocument(description);
 const markOrder={bold:0,italic:1,underline:2,textStyle:3,link:4};
 function render(node:DescriptionNode,key:number):ReactNode{
  const children=node.content?.map(render),style:CSSProperties={textAlign:node.attrs?.textAlign as CSSProperties['textAlign']},spacing=node.attrs?.paragraphSpacing;
  if(node.type==='text'){let value:ReactNode=respectfulText(node.text||'');for(const mark of [...(node.marks||[])].sort((a,b)=>markOrder[a.type]-markOrder[b.type])){if(mark.type==='bold')value=<strong>{value}</strong>;if(mark.type==='italic')value=<em>{value}</em>;if(mark.type==='underline')value=<u>{value}</u>;if(mark.type==='textStyle')value=<span style={{color:mark.attrs?.color,fontSize:mark.attrs?.fontSize?`${Number.parseInt(mark.attrs.fontSize)/16}rem`:undefined}}>{value}</span>;if(mark.type==='link')value=<a href={mark.attrs?.href} rel="noopener noreferrer">{value}</a>}return <Fragment key={key}>{value}</Fragment>}
  if(node.type==='hardBreak')return <br key={key}/>;
  if(node.type==='paragraph')return <p key={key} style={style} data-spacing={spacing}>{children?.length?children:<br/>}</p>;
  if(node.type==='heading'){const Tag=node.attrs?.level===2?'h2':node.attrs?.level===3?'h3':'h4';return <Tag key={key} style={style} data-spacing={spacing}>{children}</Tag>}
  if(node.type==='bulletList')return <ul key={key}>{children}</ul>;
  if(node.type==='orderedList')return <ol key={key} start={Number(node.attrs?.start)||1}>{children}</ol>;
  if(node.type==='listItem')return <li key={key}>{children}</li>;
  if(node.type==='image')return <figure key={key}><img src={String(node.attrs?.src)} alt={String(node.attrs?.alt)} loading="lazy" decoding="async"/>{node.attrs?.caption&&<figcaption>{respectfulText(String(node.attrs.caption))}</figcaption>}</figure>;
  return null;
 }
 return <div className="product-rich-content">{doc.content.map(render)}</div>;
}
