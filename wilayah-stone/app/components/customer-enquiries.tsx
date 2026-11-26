'use client';

import {useState} from 'react';
import {RefreshCw} from 'lucide-react';
import type {PublicSupportRecord} from '../../lib/support';

export function CustomerEnquiries({entries,onRefresh,mayHaveMore=false}:{entries:PublicSupportRecord[];onRefresh:()=>Promise<void>;mayHaveMore?:boolean}) {
  const [refreshing,setRefreshing]=useState(false);
  return <section className="account-enquiries" aria-labelledby="enquiries-title">
    <div className="support-heading"><h2 id="enquiries-title">Your enquiries</h2><button type="button" className="outline" disabled={refreshing} onClick={async()=>{setRefreshing(true);try{await onRefresh()}finally{setRefreshing(false)}}}><RefreshCw size={15}/>{refreshing?'Refreshing…':'Refresh enquiries'}</button></div>
    {entries.length?entries.map(record=><article className="request-card enquiry-card" key={record.id}>
      <div className="support-heading"><h3 dir="auto">{record.data.subject}</h3><span className="pill">{record.data.status}</span></div>
      <p className="support-reference">{record.data.reference} · {new Date(record.created).toLocaleDateString('en-GB')}</p>
      <h4>Your message</h4><p className="preserve-lines" dir="auto">{record.data.message}</p>
      {record.data.response&&<div className="support-response"><h4>Wilayah Stone team</h4><p className="preserve-lines" dir="auto">{record.data.response}</p>{record.data.responseUpdatedAt&&<p className="small muted">Updated {new Date(record.data.responseUpdatedAt).toLocaleString()}</p>}</div>}
    </article>):<div className="notice-box"><p>Your messages and the team’s responses will appear here.</p><a className="text-link" href="/help">Send an enquiry ↗</a></div>}
    {mayHaveMore&&<p className="small muted">Showing your 100 most recent enquiries. Contact the team if you need an older record.</p>}
  </section>;
}
