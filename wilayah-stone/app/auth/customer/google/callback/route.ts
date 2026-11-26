import {createCustomerAuth} from '../../../../../lib/server/customer-auth';
import {json} from '../../../../../lib/http';
export const dynamic = 'force-dynamic';
export function GET(req: Request) {
  try { const auth = createCustomerAuth(req); return auth.finish(Response.redirect(auth.config.site + '/account?mode=signin', 303)); }
  catch { return json({error: 'Open the account page at the official store address.'}, 403); }
}
