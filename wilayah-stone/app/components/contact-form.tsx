'use client';

import {useRef,useState,FormEvent} from 'react';
import {ArrowRight,CheckCircle2} from 'lucide-react';
import {EnquiryIntro} from './contact-channels';
import {CustomerLogin} from './customer-login';

export function ContactForm({signedIn,identityLoaded,onSubmitted}:{signedIn:boolean;identityLoaded:boolean;onSubmitted:()=>Promise<void>}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState(''),[expired,setExpired]=useState(false);
  const attempt=useRef<{payload:string;key:string}|null>(null);
  const canSend=signedIn&&!expired;
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(busy||!canSend)return;
    const form=event.currentTarget,f=new FormData(form);
    const data={email:String(f.get('email')||'').trim(),subject:String(f.get('subject')||'').trim(),message:String(f.get('message')||'').trim()};
    const payload=JSON.stringify(data);
    if(attempt.current?.payload!==payload)attempt.current={payload,key:crypto.randomUUID()};
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/store',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'enquiry',idempotencyKey:attempt.current.key,data})});
      const result:any=await response.json().catch(()=>({}));
      if(response.status===401){setExpired(true);throw Error('Please sign in again to send your enquiry.');}
      if(!response.ok)throw Error(result.error||'Your message could not be saved. Please try again.');
      if(typeof result.reference!=='string')throw Error('We could not retrieve your reference. Please try again.');
      setReceipt(result.reference);attempt.current=null;form.reset();await onSubmitted();
    }catch(e){setError(e instanceof Error?e.message:'Your message could not be saved. Please try again.');}
    finally{setBusy(false);}
  }
  if(receipt)return <section className="form-panel enquiry-receipt" aria-label="Enquiry confirmation"><CheckCircle2 size={28} aria-hidden="true"/><h2>Your enquiry is with us.</h2><p>Keep your reference: <strong>{receipt}</strong></p><p>You can follow its status and read the team’s response in your account.</p><a className="primary" href="/account">View my enquiries <ArrowRight size={17}/></a><button className="text-link" type="button" onClick={()=>setReceipt('')}>Send another enquiry</button></section>;
  if(identityLoaded&&!signedIn)return <section className="contact-account"><EnquiryIntro/><CustomerLogin returnTo="/help"/></section>;
  return <form className="form-panel contact-form" onSubmit={submit} aria-label="Contact Wilayah Stone">
    <EnquiryIntro/>
    {!identityLoaded?<p className="contact-form-note" role="status">Loading your account…</p>:!canSend?<p className="contact-form-note">Sign in to send a message and read the team’s response in your account. You can also message the atelier on WhatsApp above.</p>:null}
    <fieldset disabled={busy||!canSend||!identityLoaded}>
      <label>Your email<input name="email" type="email" autoComplete="email" required maxLength={200}/></label>
      <label>Subject<input name="subject" type="text" dir="auto" required minLength={3} maxLength={150} placeholder="For example, sizing help or a design question"/></label>
      <label>Message<textarea name="message" dir="auto" minLength={5} maxLength={3000} rows={6} required placeholder="Share the details and include your design or request reference, if you have one."/></label>
    </fieldset>
    <p className="contact-form-note">Your enquiry and any response are saved in your account. Please read our <a href="/privacy">privacy notice</a> before sharing personal information.</p>
    {error&&<p className="contact-form-error" role="alert">{error}</p>}
    {canSend?<button disabled={busy||!identityLoaded} className="primary" type="submit">{busy?'Saving your enquiry…':'Send enquiry'} <ArrowRight size={17}/></button>:<a href="/account?next=%2Fhelp" target="_top" className="primary">Sign in to send an enquiry <ArrowRight size={17}/></a>}
  </form>;
}
