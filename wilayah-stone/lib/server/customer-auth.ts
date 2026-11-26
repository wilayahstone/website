import {hasServerConnection} from './runtime-config';
import {createEmailAuth, verifiedEmailSession} from './email-sessions';
import {passwordCustomer} from './password-auth';
import {runtime} from './runtime';
import {insertRecord} from './data';
export const createCustomerAuth = (req: Request) => createEmailAuth(req, 'customer');
export async function verifiedCustomer(auth: ReturnType<typeof createCustomerAuth>) {
  const current = await passwordCustomer(auth);
  if (current || !auth.hasSession) return current;
  // Honour the remaining lifetime of already-issued customer email sessions.
  return (await verifiedEmailSession(auth))?.user || null;
}
export async function rememberCustomer(user: {userId: string; email: string; displayName: string}) {
  await insertRecord('profile:' + user.userId, 'setting', user.userId, {
    email: user.email, displayName: user.displayName, joinedAt: new Date().toISOString()
  });
}
export function customerProviderStatus() {
  const env = runtime();
  return {password: !!env.SUPABASE_PUBLISHABLE_KEY&&hasServerConnection(env)};
}
