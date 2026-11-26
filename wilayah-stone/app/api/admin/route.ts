import {z} from 'zod';
import {adminAuthConfig,createAdminAuth,verifiedEmailUser} from '../../../lib/server/admin-auth';
import {getStaff,registrationState,selectRole} from '../../../lib/server/access';
import {storeGET,storePOST} from '../../../lib/server/store-handler';
import {HttpError,json,readJson,requireSameOrigin} from '../../../lib/http';
export const dynamic='force-dynamic';
const actions=new Set(['product','request-status','quote','withdraw-quote','supplier','post','support-status','support-update','team','operation-save','ordering-settings','manual-order','order-status','archive-record','restore-record']);
async function context(req:Request){
 const auth=adminAuthConfig()?createAdminAuth(req):null;
 const verified=auth?.hasSession?await verifiedEmailUser(auth):null;
 if(!verified){auth?.clear();return {auth,user:null,staff:null,provider:'email'}}
 const user=verified.user,staff=await getStaff(user);return {auth,user,staff,provider:user.authProvider||'email'};
}
export async function GET(req:Request){let ctx:Awaited<ReturnType<typeof context>>|undefined;try{
 ctx=await context(req);if(!ctx.user)return ctx.auth?.finish(json({error:'Sign in with an approved staff account.'},401))||json({error:'Sign in with an approved staff account.'},401);const requestedView=new URL(req.url).searchParams.get('view');if(requestedView==='session')return ctx.auth!.finish(json(await registrationState(ctx.user)));if(!ctx.staff)return ctx.auth!.finish(json({error:'Choose your role to request access to the store workspace.'},403));const state=await registrationState(ctx.user);if(state.stage!=='ready')return ctx.auth!.finish(json({error:'Complete your role selection to enter the workspace.',onboarding:true},409));
 const view=new URL(req.url).searchParams.get('view');if(!['admin','records','upload','operations','ordering-settings','reports','trash'].includes(view||''))return json({error:'Unknown administrative view.'},400);
 let result=await storeGET(req,ctx.user);if(view==='admin'&&result.ok){const body:any=await result.json();result=json({...body,accessMode:ctx.provider,identity:{email:ctx.staff.user.email,displayName:ctx.staff.user.displayName,provider:ctx.provider}})}return ctx.auth?ctx.auth.finish(result):result;
 }catch(e){const result=json({error:e instanceof HttpError?e.message:'Administration is temporarily unavailable.'},e instanceof HttpError?e.status:503);return ctx?.auth?ctx.auth.finish(result):result}}
export async function POST(req:Request){let ctx:Awaited<ReturnType<typeof context>>|undefined;try{
 requireSameOrigin(req);ctx=await context(req);if(!ctx.user)throw new HttpError(401,'Sign in with an approved staff account.');const body=await readJson(req,350000);if(body?.action==='request-access')return ctx.auth!.finish(json(await selectRole(ctx.user,body.role)));if(!ctx.staff)throw new HttpError(403,'An assigned store role is required.');if((await registrationState(ctx.user)).stage!=='ready')throw new HttpError(409,'Complete your role selection first.');
 if(!body||typeof body!=='object'||!actions.has(body.action))throw new HttpError(400,'Unknown administrative operation.');
 const headers=new Headers(req.headers);headers.delete('content-length');const forwarded=new Request(req.url,{method:'POST',headers,body:JSON.stringify(body)});const result=await storePOST(forwarded,ctx.user);return ctx.auth?ctx.auth.finish(result):result;
 }catch(e){const result=json({error:e instanceof HttpError?e.message:e instanceof z.ZodError?'Choose a valid role and complete the required fields.':'Your changes could not be saved.'},e instanceof HttpError?e.status:e instanceof z.ZodError?400:503);return ctx?.auth?ctx.auth.finish(result):result}}
