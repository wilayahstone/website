import {revokeEmailSession} from '../../../../lib/server/email-sessions';
import {createAdminAuth,verifiedEmailUser} from '../../../../lib/server/admin-auth';
import {getStaff,audit} from '../../../../lib/server/access';
import {requireSameOrigin,json,HttpError} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 let auth:ReturnType<typeof createAdminAuth>|undefined;
 const done=(status:string)=>{auth!.clear();return auth!.finish(Response.redirect(auth!.config.site+'/admin?auth_status='+status,303))};
 try{requireSameOrigin(req);auth=createAdminAuth(req);if(new URL(req.url).origin!==auth.config.site)return json({error:'Invalid sign-out address.'},400);const verified=await verifiedEmailUser(auth),staff=verified?await getStaff(verified.user):null;await revokeEmailSession(auth);if(staff)await audit(staff,'auth.'+(verified!.user.authProvider||'email')+'.sign_out',verified!.sessionId,{provider:verified!.user.authProvider||'email'});return done('signed_out')}catch(e){if(auth)return done('unavailable');return json({error:e instanceof HttpError?e.message:'Sign-out is temporarily unavailable.'},e instanceof HttpError?e.status:503)}
}
