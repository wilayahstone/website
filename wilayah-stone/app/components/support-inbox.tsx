'use client';

import {useEffect,useState,FormEvent} from 'react';
import {Search,MessageSquare} from 'lucide-react';
import {supportReference,supportStatuses} from '../../lib/support';

type Save=(payload:{id:string;kind:'enquiry';status:string;notes:string;response:string;expectedUpdatedAt:string})=>Promise<boolean>;

function EnquiryEditor({record,canWrite,busy,onSave}:{record:any;canWrite:boolean;busy:boolean;onSave:Save}) {
  const [status,setStatus]=useState(record.data.status||'Open'),[notes,setNotes]=useState(record.data.staffNotes||''),[response,setResponse]=useState(record.data.response||'');
  useEffect(()=>{setStatus(record.data.status||'Open');setNotes(record.data.staffNotes||'');setResponse(record.data.response||'')},[record.updated]);
  async function save(event:FormEvent) {
    event.preventDefault();if(busy||!canWrite)return;
    await onSave({id:record.id,kind:'enquiry',status,notes,response,expectedUpdatedAt:record.updated});
  }
  return <details className="admin-panel support-thread">
    <summary><span><strong dir="auto">{record.data.subject||'Customer enquiry'}</strong><small>{record.data.email} · {supportReference(record)}</small></span><span className="pill">{record.data.status||'Open'}</span></summary>
    <p className="small muted">Received {new Date(record.created).toLocaleString()} · Updated {new Date(record.updated).toLocaleString()}</p>
    <div className="support-original"><h3>Customer message</h3><p className="preserve-lines" dir="auto">{record.data.message}</p></div>
    {canWrite?<form onSubmit={save}>
      <label>Enquiry status<select value={status} onChange={e=>setStatus(e.target.value)} disabled={busy}>{supportStatuses.map(v=><option key={v}>{v}</option>)}</select></label>
      <div className="support-editor-grid">
        <label>Customer response<textarea dir="auto" value={response} onChange={e=>setResponse(e.target.value)} rows={6} maxLength={3000} disabled={busy} placeholder="Write the response the customer should see."/><small>Shown in the customer’s account when saved. This does not send an email.</small></label>
        <label>Private staff notes<textarea dir="auto" value={notes} onChange={e=>setNotes(e.target.value)} rows={6} maxLength={3000} disabled={busy} placeholder="Internal review and follow-up details."/><small>Visible only to authorised staff.</small></label>
      </div>
      <button type="submit" className="primary" disabled={busy}>{busy?'Saving…':'Save response & status'}</button>
    </form>:<><h3>Customer response</h3><p className="preserve-lines" dir="auto">{record.data.response||'No response saved.'}</p><h3>Private staff notes</h3><p className="preserve-lines" dir="auto">{record.data.staffNotes||'No private notes.'}</p></>}
  </details>;
}

export function SupportInbox({records,canWrite,busy,onSave}:{records:any[];canWrite:boolean;busy:boolean;onSave:Save}) {
  const [query,setQuery]=useState(''),[status,setStatus]=useState('All statuses');
  const term=query.trim().toLowerCase();
  const filtered=records.filter(r=>(status==='All statuses'||(r.data.status||'Open')===status)&&`${r.data.subject||''} ${r.data.email||''} ${supportReference(r)} ${r.data.message||''}`.toLowerCase().includes(term));
  return <section className="support-inbox" aria-labelledby="support-inbox-title">
    <div className="support-heading"><h2 id="support-inbox-title">Customer enquiries</h2><MessageSquare size={22} aria-hidden="true"/></div>
    <p>Review the message, keep private notes and save a response for the customer’s account.</p>
    <div className="support-toolbar"><label><span><Search size={15} aria-hidden="true"/>Search loaded enquiries</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Subject, email, reference or message" maxLength={200}/></label><label>Filter by status<select value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{supportStatuses.map(s=><option key={s}>{s}</option>)}</select></label></div>
    <p className="small muted">Showing {filtered.length} of {records.length} loaded enquiries. Use Load more records to include older messages.</p>
    {filtered.length?filtered.map(r=><EnquiryEditor key={r.id} record={r} canWrite={canWrite} busy={busy} onSave={onSave}/>):<p className="empty">{records.length?'No enquiries match these filters.':'New contact messages will appear here.'}</p>}
  </section>;
}
