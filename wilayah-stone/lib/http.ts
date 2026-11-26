export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
export function json(data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...extra}})}
export async function readLimited(request:Request,maxBytes:number){
 const declared=request.headers.get('content-length');
 if(declared&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw new HttpError(413,'This request is too large.');
 if(!request.body)return new Uint8Array();
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>maxBytes){await reader.cancel();throw new HttpError(413,'This request is too large.')}chunks.push(chunk.value)}}finally{reader.releaseLock()}
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength}return result;
}
export async function readJson(request:Request,maxBytes=100000){
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw new HttpError(415,'Use a JSON request.');
 try{return JSON.parse(new TextDecoder().decode(await readLimited(request,maxBytes)))}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Please send a valid request.')}
}
export function requireSameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new HttpError(403,'This request could not be accepted.');const site=request.headers.get('sec-fetch-site');if(site&&site!=='same-origin'&&site!=='none')throw new HttpError(403,'This request could not be accepted.')}
export function imageMatches(bytes:Uint8Array,type:string){
 if(type==='image/png')return bytes.length>=24&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
 if(type==='image/jpeg')return bytes.length>=12&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 return type==='image/webp'&&bytes.length>=20&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
}
export function safeFilename(value:string){return value.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,100)||'design-reference'}
