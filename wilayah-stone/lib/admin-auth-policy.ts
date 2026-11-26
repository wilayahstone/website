import type {StoreUser} from './identity';
export const ADMIN_COOKIE='__Host-ws-admin-auth';
export const ATTEMPT_COOKIE='__Host-ws-admin-attempt';
export type StaffIdentity=StoreUser&{authProvider?:'email'|'shared_code'};
export const adminAuthMessages:Record<string,string>={not_configured:'Sign-in is temporarily unavailable. Please try again later.',cancelled:'Sign-in was cancelled. You can try again.',expired:'Your sign-in request expired. Please start again.',access_denied:'This account does not have staff access. Choose an approved account.',unavailable:'Sign-in is temporarily unavailable. Please try again shortly.',signed_out:'You have signed out.'};
