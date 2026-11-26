export function SelectionSummary({selections}:{selections?:{sku:string;name:string;options?:{name:string;value:string}[];size:string;engraving:string}[]}){
 if(!selections?.length)return null;
 return <div className="selection-summaries">{selections.map((selection,index)=><p className="order-variation-summary" key={index}><strong>{selection.sku}</strong> · {selection.name}{selection.options?.map(option=>' · '+option.name+': '+option.value).join('')} · Ring size {selection.size} · {selection.engraving||'Plain'}</p>)}</div>;
}
