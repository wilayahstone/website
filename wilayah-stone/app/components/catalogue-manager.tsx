'use client';
import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Plus,ArrowUpRight,Search,Save,Send} from 'lucide-react';
import {stones,type Product} from '../../lib/catalog';
import {parseProductDescription,descriptionText,type ProductDescription} from '../../lib/product-description';
import type {DescriptionEditorHandle} from './rich-description-editor';
import {AttributeManager,VolumePricingManager} from './product-commerce-manager';
import {parseProductCommerce,listingState,listingIsPublic} from '../../lib/product-commerce';
import {VariationManager} from './variation-manager';
import {parseVariationSetup} from '../../lib/variations';
import {productPublicationIssues} from '../../lib/product-publication';
import {ProductImage} from './product-image';
import {MediaUpload} from './media-upload';
import {DeleteRecord} from './record-archive';
const RichDescriptionEditor=lazy(()=>import('./rich-description-editor'));
type Mutate=(action:string,payload:any,message?:string)=>Promise<boolean>;
type EditorState={ready:boolean;valid:boolean;draftValid:boolean;uploading:boolean;issue:string};
function localDateTime(value:string){const date=new Date(value);return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)}
const emptyEditorState:EditorState={ready:false,valid:false,draftValid:false,uploading:false,issue:''};
export function CatalogueManager({products,suppliers,busy,mutate,canWrite,canArchive}:{products:Product[];suppliers:any[];busy:boolean;mutate:Mutate;canWrite:boolean;canArchive:boolean}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('All products'),[editing,setEditing]=useState<Product|null>(null),[creating,setCreating]=useState(false),[uploading,setUploading]=useState<Record<number,boolean>>({}),[descriptionState,setDescriptionState]=useState<EditorState>(emptyEditorState),[issues,setIssues]=useState<string[]>([]),[saving,setSaving]=useState<'draft'|'publish'|'schedule'|null>(null);
 const original=useRef(''),savingLock=useRef(false),errorBox=useRef<HTMLDivElement>(null),descriptionEditor=useRef<DescriptionEditorHandle>(null);
 const dirty=!!editing&&JSON.stringify(editing)!==original.current,locked=busy||saving!==null;
 useEffect(()=>{if(!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 function start(product?:Product){
  setDescriptionState(emptyEditorState);setUploading({});setIssues([]);setCreating(!product);
  const value:Product=product?structuredClone(product):{id:'PRD-'+crypto.randomUUID().replace(/-/g,'').slice(0,20).toUpperCase(),sku:'',name:'',stone:'',engraving:'Plain',metal:'925 sterling silver',price:null,status:'Design preview',weight:'',dimensions:'',origin:'',treatment:'',description:'',supplier:'',capacity:0,deliveryDays:0,verified:false,published:false,custom:true,imageIds:[]};
  original.current=JSON.stringify(value);setEditing(value);window.scrollTo({top:0,behavior:'smooth'});
 }
 function close(){if(locked)return;if(dirty&&!window.confirm('Discard the unsaved changes? Choose Cancel to continue editing and save a draft.'))return;setEditing(null);setIssues([])}
 const update=(key:keyof Product,value:any)=>{setIssues([]);setEditing(old=>old?{...old,[key]:value}:old)};
 const image=(index:number,id:string)=>{const values=[...(editing?.imageIds||[])];values[index]=id;update('imageIds',values)};
 function showIssues(messages:string[]){setIssues(messages);requestAnimationFrame(()=>errorBox.current?.focus())}
 async function save(intent:'draft'|'publish'|'schedule'){
  if(!editing||savingLock.current||locked)return;
  const current=descriptionEditor.current?.snapshot();if(!current?.ready){showIssues(['Please wait for the description editor to open.']);return}
  if(current.uploading||Object.values(uploading).some(Boolean)){showIssues(['Please wait for the image upload to finish.']);return}
  if(current.dialogOpen){showIssues(['Finish or close the open description dialog before saving.']);return}
  let descriptionRichText:ProductDescription;try{descriptionRichText=parseProductDescription(current.doc)}catch(error){showIssues([error instanceof Error?error.message:'Check the description formatting.']);return}
  let variations,commerce;try{variations=parseVariationSetup(editing);commerce=parseProductCommerce(editing)}catch(error){showIssues([error instanceof Error?error.message:'Check the variation details.']);return}
  const data={...editing,...commerce,...variations,description:descriptionText(descriptionRichText),descriptionRichText,published:intent!=='draft',imageIds:(editing.imageIds||[]).filter(Boolean)};
  if(intent==='schedule'&&(!editing.publishAt||Date.parse(editing.publishAt)<=Date.now())){showIssues(['Choose a future publication date and time.']);return}if(intent!=='draft'){const missing=productPublicationIssues(data);if(missing.length){showIssues(missing);return}}
  savingLock.current=true;setSaving(intent);setIssues([]);
  try{const ok=await mutate('product',{intent,create:creating,expectedUpdatedAt:creating?undefined:editing.updated,data},intent==='schedule'?'Listing scheduled. It will appear automatically at the selected time.':intent==='draft'?'Draft saved. Reopen it from the Drafts list to continue editing.':creating?'Product created and published.':editing.published===false?'Product published.':'Product changes saved.');if(ok){original.current='';setEditing(null);setFilter(intent==='draft'?'Drafts':intent==='schedule'?'Scheduled':'Published');setQuery('')}else showIssues(['The product could not be saved. Your work is still in the editor. Check the message above, then try again.'])}finally{savingLock.current=false;setSaving(null)}
 }
 const visible=products.filter(p=>(filter==='All products'||filter==='Drafts'&&listingState(p)==='Draft'||filter==='Published'&&listingState(p)==='Published'||filter==='Scheduled'&&listingState(p)==='Scheduled')&&[p.id,p.sku,p.name,p.stone,...(p.variations||[]).map(variation=>variation.sku)].join(' ').toLowerCase().includes(query.toLowerCase()));
 return <>
  <div className="workspace-heading"><div><h2>Products & catalogue</h2><p>Create products, manage SKUs and images, and return to saved drafts whenever you need.</p></div>{canWrite&&<button type="button" className="primary" disabled={locked||!!editing} onClick={()=>start()}><Plus size={17}/>Add product</button>}</div>
  {editing&&<form className="admin-panel catalogue-editor" noValidate onKeyDown={event=>{if(event.key==='Enter'&&event.target instanceof HTMLInputElement&&!event.target.closest('dialog'))event.preventDefault()}} onSubmit={event=>{event.preventDefault();const button=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;void save(button?.value==='draft'?'draft':button?.value==='schedule'?'schedule':'publish')}}>
   <div className="row"><div><span className="eyebrow">{creating?'NEW PRODUCT':editing.published===false?'EDIT DRAFT':'EDIT PRODUCT'}</span><h3>{editing.name||'Untitled product'}</h3></div><button className="text-link" type="button" disabled={locked} onClick={close}>Close editor</button></div>
   {issues.length>0&&<div className="catalogue-save-errors" role="alert" tabIndex={-1} ref={errorBox}><strong>Before you save</strong><ul>{issues.map(message=><li key={message}>{message}</li>)}</ul></div>}
   <div className="form-grid">
    <label>Product SKU<input maxLength={40} value={editing.sku||''} disabled={locked} onChange={event=>update('sku',event.target.value.toUpperCase())}/><small>Leave blank to assign a SKU automatically. Existing product links remain the same.</small></label>
    <label>Product name<input maxLength={150} value={editing.name} disabled={locked} onChange={event=>update('name',event.target.value)}/></label>
    <label>Gemstone<select value={editing.stone} disabled={locked||!editing.custom} onChange={event=>update('stone',event.target.value)}><option value="">Choose a gemstone</option>{stones.map(stone=><option key={stone}>{stone}</option>)}</select></label>
    <label>Engraving / design name<input maxLength={100} disabled={locked||!editing.custom} value={editing.engraving} onChange={event=>update('engraving',event.target.value)}/></label>
    <label>Metal<input value="925 sterling silver" readOnly/></label>
    <label>Availability<select value={editing.status} disabled={locked} onChange={event=>update('status',event.target.value)}>{['Design preview','Ready for review','Unavailable'].map(value=><option key={value}>{value}</option>)}</select></label>
   </div>
   <Suspense fallback={<p role="status">Opening description editor…</p>}><RichDescriptionEditor ref={descriptionEditor} key={editing.id} description={editing.description} richText={editing.descriptionRichText} disabled={locked} onStateChange={setDescriptionState} onChange={(description:string,descriptionRichText:ProductDescription)=>{setIssues([]);setEditing(old=>old?{...old,description,descriptionRichText}:old)}}/></Suspense>
   <AttributeManager attributes={editing.attributes||[]} options={editing.variationOptions||[]} disabled={locked} onChange={value=>update('attributes',value)} onOptions={value=>update('variationOptions',value)}/>
   <VolumePricingManager enabled={editing.volumePricingEnabled||false} tiers={editing.quantityDiscounts||[]} disabled={locked} onChange={(enabled,tiers)=>{update('volumePricingEnabled',enabled);update('quantityDiscounts',tiers)}}/>
   <VariationManager key={'variations-'+editing.id} value={{variationOptions:editing.variationOptions||[],variations:editing.variations||[],showVariationPrices:editing.showVariationPrices||false}} disabled={locked} onChange={value=>{setIssues([]);setEditing(old=>old?{...old,...value}:old)}}/>
   <h4>Product images</h4><p className="small">New products need a main and detail view before publishing. Existing catalogue images stay in place until replaced. A draft can be saved with images still to come.</p>
   <div className="admin-image-grid">{[0,1].map(index=><MediaUpload key={editing.id+'-'+index} purpose="product-image" label={index?'Detail / hover image':'Main product image'} value={editing.imageIds?.[index]} onChange={id=>image(index,id)} onBusyChange={value=>setUploading(old=>({...old,[index]:value}))} disabled={locked}/>)}</div>
   <h4>Specifications & sourcing</h4><div className="form-grid">
    {([['weight','Silver weight and tolerance'],['dimensions','Stone dimensions'],['origin','Disclosed origin'],['treatment','Treatment disclosure']] as const).map(([key,label])=><label key={key}>{label}<input maxLength={100} value={editing[key]} disabled={locked} onChange={event=>update(key,event.target.value)}/></label>)}
    <label>Supplier<select value={editing.supplier} disabled={locked} onChange={event=>update('supplier',event.target.value)}><option value="">Choose supplier</option>{suppliers.map(supplier=><option key={supplier.id} value={supplier.id}>{supplier.data.name}</option>)}</select></label>
    <label>Internal retail price (PKR)<input type="number" min="0" step=".01" value={editing.price??''} disabled={locked} onChange={event=>update('price',event.target.value?Number(event.target.value):null)}/><small>Fallback price for variations. Prices appear publicly only when you enable the variation price display.</small></label>
    <label>Reserved units<input type="number" min="0" max="10000" value={editing.capacity} disabled={locked} onChange={event=>update('capacity',Number(event.target.value))}/></label>
    <label>Production days<input type="number" min="0" max="365" value={editing.deliveryDays} disabled={locked} onChange={event=>update('deliveryDays',Number(event.target.value))}/></label>
   </div>
   <label className="checkbox"><input type="checkbox" checked={editing.verified} disabled={locked} onChange={event=>update('verified',event.target.checked)}/>Measured specifications and disclosures reviewed against evidence</label>
   <section className="variation-manager"><h4>Schedule your listing</h4><p>Choose a future date and time in your local timezone. The listing appears automatically at that time.</p><label>Publication date and time<input type="datetime-local" value={editing.publishAt?localDateTime(editing.publishAt):''} disabled={locked} onInput={event=>{const value=event.currentTarget.value,date=new Date(value);if(!value||Number.isFinite(date.getTime()))update('publishAt',value?date.toISOString():null)}} onChange={event=>{const value=event.target.value,date=new Date(value);if(!value||Number.isFinite(date.getTime()))update('publishAt',value?date.toISOString():null)}}/></label><button type="submit" className="outline" value="schedule" disabled={locked||!editing.publishAt}>Schedule listing</button></section><div className="catalogue-save-bar"><p>{editing.published===false?'Drafts are private. Save your progress now and publish when the listing is complete.':'Save changes to update the storefront. Saving as a draft hides this product until you publish it again.'}</p><div className="row">
    <button className="outline" type="submit" name="intent" value="draft" formNoValidate disabled={locked||!descriptionState.ready||descriptionState.uploading||Object.values(uploading).some(Boolean)}><Save size={17}/>{saving==='draft'?'Saving draft…':'Save as draft'}</button>
    <button className="primary" type="submit" name="intent" value="publish" disabled={locked||!descriptionState.ready||descriptionState.uploading||Object.values(uploading).some(Boolean)}><Send size={17}/>{saving==='publish'?'Saving…':creating?'Create & publish product':editing.published===false?'Publish product':'Save changes'}</button>
    <button className="text-link" type="button" disabled={locked} onClick={close}>Cancel</button>
   </div></div>
  </form>}
  <div className="catalogue-list-tools"><label className="admin-search"><Search size={16}/>Find a product<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="SKU, gemstone or product name"/></label><label>Show<select value={filter} onChange={event=>setFilter(event.target.value)}>{['All products','Drafts','Scheduled','Published'].map(value=><option key={value}>{value}</option>)}</select></label></div>
  <div className="catalogue-admin-list">{visible.map(product=><article key={product.id} className="admin-panel catalogue-admin-product"><div className="catalogue-admin-image">{!product.custom||product.imageIds?.length?<ProductImage product={product}/>:<span>Add product images</span>}</div><div><span className="pill">{listingState(product)==='Scheduled'?'Scheduled':product.published===false?'Draft':product.status==='Unavailable'?'Unavailable':'Published'}</span><h3>{product.name||'Untitled product'}</h3>{listingState(product)==='Scheduled'&&<p className="small">Publishes {new Date(product.publishAt!).toLocaleString()}</p>}<p className="record-reference">SKU {product.sku||product.id}</p><p className="small">{product.stone||'Gemstone not selected'} · {product.metal}</p><div className="row">{canWrite&&<button type="button" className="outline" disabled={locked||!!editing} onClick={()=>start(product)}>{product.published===false?'Resume draft':'Edit product'}</button>}{listingIsPublic(product)&&<a className="text-link" href={'/product/'+product.id} target="_blank" rel="noopener noreferrer">View product <ArrowUpRight size={15}/></a>}{canArchive&&<DeleteRecord id={product.id} kind="product" updated={product.updated||undefined} busy={locked||!!editing} mutate={mutate}/>}</div></div></article>)}</div>
  {!visible.length&&<p className="empty">{filter==='Drafts'?'Your saved drafts will appear here.':'No products match this view.'}</p>}
 </>;
}
