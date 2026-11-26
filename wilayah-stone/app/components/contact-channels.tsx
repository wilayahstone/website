import type {SVGProps} from 'react';
import {ArrowUpRight, MessageCircle} from 'lucide-react';
import {WhatsAppButton} from './whatsapp';
import {publicContact} from '../../lib/contact';

function Instagram({size=20,...props}:SVGProps<SVGSVGElement>&{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}

function Facebook({size=20,...props}:SVGProps<SVGSVGElement>&{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 21v-8h2.7l.5-3H14V8.1c0-.9.3-1.6 1.7-1.6h1.7V3.8c-.7-.1-1.5-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8z"/></svg>;
}

export function FooterContact() {
  return <div className="footer-contact">
    <WhatsAppButton className="footer-whatsapp" label={publicContact.whatsappDisplay} fallback={false}/><p className="small">Orders, personalisation & customer support</p><div className="footer-socials" aria-label="Wilayah Stone social profiles">
      <a href={publicContact.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={15} aria-hidden="true"/>Instagram<span className="sr-only"> (opens in a new tab)</span></a>
      <a href={publicContact.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={15} aria-hidden="true"/>Facebook<span className="sr-only"> (opens in a new tab)</span></a>
    </div>
  </div>;
}

export function ContactChannels() {
  return <><div className="contact-whatsapp"><WhatsAppButton label="Start a WhatsApp conversation"/></div><section className="contact-channels" aria-label="Ways to reach Wilayah Stone">
    <a className="contact-channel primary-contact" href={publicContact.whatsappHref} target="_blank" rel="noopener noreferrer">
      <span className="contact-channel-top"><MessageCircle size={21} aria-hidden="true"/><ArrowUpRight size={17} aria-hidden="true"/></span>
      <h2>Speak to the atelier</h2><span className="contact-channel-address">{publicContact.whatsappDisplay}</span>
      <p>Our primary WhatsApp contact for orders, design questions, payments and after-sales support.</p>
    </a>
    <a className="contact-channel" href={publicContact.instagram} target="_blank" rel="noopener noreferrer">
      <span className="contact-channel-top"><Instagram size={21} aria-hidden="true"/><ArrowUpRight size={17} aria-hidden="true"/></span>
      <h2>Find us on Instagram</h2><span className="contact-channel-address">{publicContact.instagramHandle}</span>
      <p>Follow the Wilayah Stone story, from stones to considered details.</p><span className="sr-only">Opens in a new tab.</span>
    </a>
    <a className="contact-channel" href={publicContact.facebook} target="_blank" rel="noopener noreferrer">
      <span className="contact-channel-top"><Facebook size={21} aria-hidden="true"/><ArrowUpRight size={17} aria-hidden="true"/></span>
      <h2>Connect on Facebook</h2><span className="contact-channel-address">Wilayah Stone</span>
      <p>Stay connected with our community and the brand’s journey.</p><span className="sr-only">Opens in a new tab.</span>
    </a>
  </section></>;
}

export function EnquiryIntro() {
  return <div className="enquiry-intro"><div className="eyebrow">LET’S TALK ABOUT YOUR RING</div>
    <h2>Send an enquiry</h2><p>Tell us what you have in mind. For an existing request, include its reference so we can find the details.</p>
    <p>Prefer WhatsApp? <a href={publicContact.whatsappHref} target="_blank" rel="noopener noreferrer">{publicContact.whatsappDisplay}</a></p>
  </div>;
}
