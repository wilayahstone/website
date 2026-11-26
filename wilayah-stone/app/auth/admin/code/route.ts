import {z} from 'zod';
import {createAdminAuth,verifiedEmailUser} from '../../../../lib/server/admin-auth';
import {createSharedAdminSession,emailHash,sharedAdminConfigured} from '../../../../lib/server/email-sessions';
import {getStaff,audit} from '../../../../lib/server/access';
import {consumeRate} from '../../../../lib/server/data';
import {HttpError,json,readJson,requireSameOrigin} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 let auth:ReturnType<typeof createAdminAuth>|undefined;
 try{
  requireSameOrigin(req);auth=createAdminAuth(req);if(new URL(req.url).origin!==auth.config.site)throw new HttpError(403,'Open the workspace at the store address.');
  if(!sharedAdminConfigured())throw new HttpError(503,'Store access is temporarily unavailable. Please try again.');
  const input=z.object({code:z.string().regex(/^\d{6}$/)}).strict().parse(await readJson(req,500));
  const address=await emailHash(req.headers.get('cf-connecting-ip')||'unknown');
  if(!await consumeRate('store-access:'+address,5)||!await consumeRate('store-access:global',60))throw new HttpError(429,'Please wait before trying the access code again.');
  await createSharedAdminSession(auth,input.code);const verified=await verifiedEmailUser(auth),staff=verified?await getStaff(verified.user):null;
  if(!staff)throw new HttpError(503,'Store access is temporarily unavailable. Please try again.');
  await audit(staff,'auth.shared_code.sign_in',verified!.sessionId,{provider:'shared_code'});
  return auth.finish(json({ok:true,redirect:'/admin'}));
 }catch(e){const response=json({error:e instanceof HttpError?e.message:e instanceof z.ZodError?'Enter your store access code.':'Store access is temporarily unavailable. Please try again.'},e instanceof HttpError?e.status:e instanceof z.ZodError?400:503);return auth?auth.finish(response):response}
}
