import type {RecordRow} from './server/data';

export const supportStatuses=['Open','In progress','Resolved'] as const;
export type SupportStatus=typeof supportStatuses[number];
export type PublicSupportRecord={id:string;kind:string;created:string;updated:string;data:{reference:string;email:string;subject:string;message:string;status:SupportStatus;type?:string;response?:string;responseUpdatedAt?:string}};

export function supportReference(record:{id:string;data?:any}) {
  if(typeof record.data?.reference==='string')return record.data.reference;
  return 'WS-E-'+record.id.replace(/^WSE-/,'').replace(/[^a-z0-9]/gi,'').slice(0,12).toUpperCase();
}

// Customer views and exports use an allowlist, never the staff record directly.
export function publicSupport(record:RecordRow):PublicSupportRecord {
  const d=record.data;
  return {id:record.id,kind:record.kind,created:record.created,updated:record.updated,data:{
    reference:supportReference(record),email:typeof d.email==='string'?d.email:'',
    subject:typeof d.subject==='string'?d.subject:record.kind==='privacy-request'?'Privacy request: '+d.type:'Customer enquiry',
    message:typeof d.message==='string'?d.message:'',
    status:supportStatuses.includes(d.status)?d.status:'Open',
    ...(typeof d.type==='string'?{type:d.type}:{}),
    ...(typeof d.response==='string'&&d.response?{response:d.response}:{}),
    ...(typeof d.responseUpdatedAt==='string'?{responseUpdatedAt:d.responseUpdatedAt}:{}),
  }};
}
