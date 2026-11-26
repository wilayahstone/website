import {createCustomerAuth} from '../../../../lib/server/customer-auth';
import {revokeEmailSession} from '../../../../lib/server/email-sessions';
import {passwordSignOut} from '../../../../lib/server/password-auth';
import {requireSameOrigin, json, HttpError} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(req: Request) {
  try {
    requireSameOrigin(req);
    const auth = createCustomerAuth(req);
    await passwordSignOut(auth);
    await revokeEmailSession(auth);
    auth.clear();
    return auth.finish(json({ok: true}));
  } catch (error) {
    return json({error: error instanceof HttpError ? error.message : 'Please try signing out again.'}, error instanceof HttpError ? error.status : 503);
  }
}
