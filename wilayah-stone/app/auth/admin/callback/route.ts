import {adminAuthConfig,adminRedirect} from '../../../../lib/server/admin-auth';
import {json} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function GET(){const config=adminAuthConfig();return config?adminRedirect(config,'expired'):json({error:'Please return to the store and request an email code.'},400)}
