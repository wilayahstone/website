import {getRecord,getUpload,listRecords} from '../../../../lib/server/data';
import {descriptionImageIds} from '../../../../lib/product-description';
import {getProducts} from '../../../../lib/server/products';
import {journalPublic} from '../../../../lib/journal';
import {createAdminAuth,verifiedEmailUser} from '../../../../lib/server/admin-auth';
import {getStaff,can} from '../../../../lib/server/access';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return new Response(null,{status:404});const media=await getRecord(id,'upload');if(media?.owner!=='store'||!['journal-cover','product-image','product-description'].includes(media.data.purpose))return new Response(null,{status:404});
 let staffAccess=false;try{const auth=createAdminAuth(req),session=auth.hasSession?await verifiedEmailUser(auth):null,staff=session?await getStaff(session.user):null;staffAccess=!!staff&&can(staff.role,media.data.purpose==='journal-cover'?'journal.read':'catalog.read')}catch{}
 const published=staffAccess||(media.data.purpose==='journal-cover'?(await listRecords('post',undefined,500)).some(p=>journalPublic(p)&&p.data.coverImageId===id):(await getProducts()).some(p=>p.imageIds?.includes(id)||descriptionImageIds(p.descriptionRichText).includes(id)));
 if(!published)return new Response(null,{status:404});const body=await getUpload(id);if(!body)return new Response(null,{status:404});return new Response(body,{headers:{'Content-Type':media.data.type,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch{return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}})}}
