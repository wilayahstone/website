import {z} from 'zod';
import {createEmailAuth,emailHash,sendEmailCode,verifyEmailCode,verifiedEmailSession,sharedAdminMode} from './email-sessions';
import {rememberCustomer} from './customer-auth';
import {CUSTOMER_RETURN,customerReturn} from '../customer-auth-policy';
import {getStaff,audit} from './access';
import {consumeRate} from './data';
import {requireSameOrigin,readJson,json,HttpError} from '../http';
export function emailFlow(scope:'admin'|'customer'){
 return async function POST(req:Request){let auth:ReturnType<typeof createEmailAuth>|undefined;try{
  requireSameOrigin(req);auth=createEmailAuth(req,scope);if(new URL(req.url).origin!==auth.config.site)throw new HttpError(403,'Open your account at the store address.');
  if(scope==='admin'&&sharedAdminMode())throw new HttpError(400,'Enter the store access code to continue.');
  const input=z.object({action:z.enum(['send','verify']),email:z.string().trim().email().max(200).transform(v=>v.toLowerCase()),code:z.string().regex(/^\d{6}$/).optional(),returnTo:z.string().max(500).optional()}).parse(await readJson(req,2000));
  const address=await emailHash(input.email),ip=await emailHash(req.headers.get('cf-connecting-ip')||'unknown');
  if(!await consumeRate(scope+'-auth:'+input.action+':'+ip,input.action==='send'?30:100)||!await consumeRate(scope+'-email:'+input.action+':'+address,input.action==='send'?6:30))throw new HttpError(429,'Please wait before trying again.');
  if(input.action==='send'){await sendEmailCode(auth,input.email);if(scope==='customer')auth.set(CUSTOMER_RETURN,customerReturn(input.returnTo),{maxAge:300});return auth.finish(json({ok:true}));}
  const redirect=scope==='admin'?'/admin':customerReturn(auth.cookie(CUSTOMER_RETURN));await verifyEmailCode(auth,input.email,input.code||'');const session=await verifiedEmailSession(auth);if(!session)throw new HttpError(401,'Please request a new email code.');
  if(scope==='customer')await rememberCustomer(session.user);else{const staff=await getStaff(session.user);if(staff)await audit(staff,'auth.email.sign_in',session.sessionId,{provider:'email_otp'})}
  return auth.finish(json({ok:true,redirect}));
 }catch(e){const status=e instanceof HttpError?e.status:e instanceof z.ZodError?400:503,response=json({error:e instanceof HttpError?e.message:e instanceof z.ZodError?'Check your email and six-digit code, then try again.':'Account access is temporarily unavailable. Please try again.'},status);return auth?auth.finish(response):response}}
}
