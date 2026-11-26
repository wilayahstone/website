import {customerProviderStatus} from '../../../../lib/server/customer-auth';
import {json} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function GET(){return json(await customerProviderStatus())}
