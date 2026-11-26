export function secureResponse(response:Response,pathname:string){
 const headers=new Headers(response.headers);
 headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
 headers.set('Strict-Transport-Security','max-age=31536000');
 headers.set('X-Frame-Options','SAMEORIGIN');
 // Vinext injects hydration scripts and style attributes. Block objects and
 // cross-origin form posts while retaining those framework requirements.
 if(!headers.has('Content-Security-Policy'))headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com; upgrade-insecure-requests");
 if(/^\/(?:admin|account|bag|wishlist|payment|checkout)(?:\/|$)/.test(pathname)||pathname.startsWith('/api/')||pathname.startsWith('/auth/')){headers.set('Cache-Control','private, no-store');headers.set('X-Robots-Tag','noindex, nofollow')}
 if(pathname.startsWith('/auth/'))headers.set('Referrer-Policy','no-referrer');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
