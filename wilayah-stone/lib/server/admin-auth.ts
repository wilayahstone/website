import {createEmailAuth,emailSite,emailDelivery,verifiedEmailSession,sharedAdminMode,sharedAdminConfigured} from './email-sessions';
export const adminAuthConfig=emailSite;
export const createAdminAuth=(req:Request)=>createEmailAuth(req,'admin');
export const verifiedEmailUser=verifiedEmailSession;
export async function emailProviderStatus(){const configured=sharedAdminMode()?sharedAdminConfigured():await emailDelivery();return {configured,enabled:configured,available:configured,method:sharedAdminMode()?'shared_code':'email'}}
export function adminRedirect(config:{site:string},status?:string){return Response.redirect(config.site+'/admin'+(status?'?auth_status='+encodeURIComponent(status):''),303)}
