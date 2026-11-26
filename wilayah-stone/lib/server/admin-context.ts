import {createAdminAuth,verifiedEmailUser} from './admin-auth';
import {getStaff,registrationState} from './access';
import {HttpError} from '../http';
export async function requireStoreAdmin(req:Request){const auth=createAdminAuth(req),verified=auth.hasSession?await verifiedEmailUser(auth):null,staff=verified?await getStaff(verified.user):null;if(!verified||!staff||(await registrationState(verified.user)).stage!=='ready')throw new HttpError(401,'Sign in to the store workspace.');return {auth,verified,staff}}
