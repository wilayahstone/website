import {requireStoreAdmin} from '../../../../lib/server/admin-context';
import {can,audit} from '../../../../lib/server/access';
import {backend,consumeRate,putUpload,saveRecord,deleteUpload} from '../../../../lib/server/data';
import {HttpError,json,readLimited,requireSameOrigin,imageMatches,safeFilename} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(req:Request){let context:Awaited<ReturnType<typeof requireStoreAdmin>>|undefined;try{
 requireSameOrigin(req);context=await requireStoreAdmin(req);if(new URL(req.url).origin!==context.auth.config.site)throw new HttpError(403,'Open the store workspace at its official address.');
 if(!await consumeRate('store-media:'+context.staff.user.userId,40))throw new HttpError(429,'Please wait before uploading more images.');
 const contentType=req.headers.get('content-type')||'';if(!contentType.startsWith('multipart/form-data'))throw new HttpError(415,'Choose an image to upload.');
 const bytes=await readLimited(req,6*1024*1024),form=await new Response(bytes as BodyInit,{headers:{'Content-Type':contentType}}).formData(),file=form.get('file'),purpose=form.get('purpose');
 if(purpose!=='journal-cover'&&purpose!=='product-image'&&purpose!=='product-description')throw new HttpError(400,'Choose an image destination.');if(!can(context.staff.role,purpose==='journal-cover'?'journal.write':'catalog.write'))throw new HttpError(403,'You do not have access to upload this image.');
 if(!(file instanceof File)||!file.size||file.size>5*1024*1024)throw new HttpError(400,'Choose a PNG, JPEG or WebP image up to 5 MB.');const data=new Uint8Array(await file.arrayBuffer());if(!imageMatches(data,file.type))throw new HttpError(400,'Choose a valid PNG, JPEG or WebP image.');
 const id=crypto.randomUUID();await putUpload(id,data,file.type);try{await saveRecord(id,'upload','store',{name:safeFilename(file.name),type:file.type,size:file.size,purpose,storage:backend()})}catch(e){try{await deleteUpload(id)}catch{}throw e}
 await audit(context.staff,'media.uploaded',id,{purpose});return context.auth.finish(json({id,url:'/api/media/'+id}));
 }catch(e){return json({error:e instanceof HttpError?e.message:'The image could not be uploaded. Please try again.'},e instanceof HttpError?e.status:503)}}
