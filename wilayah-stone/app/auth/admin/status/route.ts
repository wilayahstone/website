import {emailProviderStatus} from '../../../../lib/server/admin-auth';
import {json} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function GET(){return json(await emailProviderStatus())}
