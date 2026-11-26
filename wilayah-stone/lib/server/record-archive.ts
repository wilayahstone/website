import {z} from 'zod';
import {catalog} from '../catalog';
import {HttpError,json} from '../http';
import {getRecord,listRecords,compareAndSet,insertRecord} from './data';
import {Staff,can,audit} from './access';
const kinds=['product','supplier','post','request','enquiry','order','quote','privacy-request','setting'] as const;
function permission(staff:Staff){if(!can(staff.role,'records.archive'))throw new HttpError(403,'A store administrator must delete or restore records.')}
function allowed(r:any){return r&&kinds.includes(r.kind)&&(r.kind!=='setting'||r.owner.startsWith('operations:')&&r.owner!=='operations:payments')}
export async function archiveRecord(staff:Staff,b:any,restore=false){permission(staff);const data=z.object({id:z.string().min(1).max(300),kind:z.enum(kinds),expectedUpdatedAt:z.string().nullable().optional(),reason:z.string().trim().min(3).max(500)}).parse(b);let r=await getRecord(data.id,data.kind);
 if(!r&&data.kind==='product'&&!restore){const p=catalog.find(p=>p.id===data.id);if(!p)throw new HttpError(404,'Product not found.');if(!await insertRecord(p.id,'product','store',p))throw new HttpError(409,'This product changed. Refresh before deleting.');r=await getRecord(p.id,'product');}
 if(!allowed(r))throw new HttpError(404,'This record cannot be deleted. Payment receipts, audit records, access settings and store configuration are retained.');if(data.expectedUpdatedAt&&r!.updated!==data.expectedUpdatedAt)throw new HttpError(409,'This record changed. Refresh before deleting or restoring it.');
 if(restore&&!r!.data.archivedAt||!restore&&r!.data.archivedAt)throw new HttpError(409,restore?'This record is already active.':'This record is already in the recycle bin.');
 if(!restore&&r!.kind==='supplier'){const allocations=Object.keys(r!.data.orderAllocations||{});if(allocations.length>200)throw new HttpError(409,'Review supplier allocations before deleting this supplier.');const orders=await Promise.all(allocations.map(id=>getRecord(id,'order')));if(orders.some(o=>o&&!['Delivered','Cancelled','Refunded'].includes(o.data.status)))throw new HttpError(409,'This supplier is assigned to an open order. Finish or resolve that commitment before deletion.');}
 const next={...r!.data};if(restore){delete next.archivedAt;delete next.archivedBy;delete next.archiveReason;}else{next.archivedAt=new Date().toISOString();next.archivedBy=staff.user.email;next.archiveReason=data.reason;}
 if(!await compareAndSet(r!,next))throw new HttpError(409,'This record changed. Refresh before continuing.');await audit(staff,restore?'record.restored':'record.deleted',r!.id,{kind:r!.kind,reason:data.reason});return json({ok:true});
}
export async function recycleBin(req:Request,staff:Staff){permission(staff);const url=new URL(req.url),kind=z.enum(kinds).parse(url.searchParams.get('kind')||'product'),offset=z.coerce.number().int().min(0).max(100000).parse(url.searchParams.get('offset')||0),rows=await listRecords(kind,undefined,101,offset);return json({rows:rows.slice(0,100).filter(r=>allowed(r)&&r.data.archivedAt),nextOffset:rows.length>100?offset+100:null})}
