import {z} from 'zod';
import {createCustomerAuth} from '../../../lib/server/customer-auth';
import {passwordSignIn} from '../../../lib/server/password-auth';
import {emailHash} from '../../../lib/server/email-sessions';
import {consumeRate, registerPasswordCustomer} from '../../../lib/server/data';
import {customerReturn} from '../../../lib/customer-auth-policy';
import {HttpError, json, readJson, requireSameOrigin} from '../../../lib/http';

export const dynamic = 'force-dynamic';

const credentials = z.object({
  action: z.enum(['signup', 'signin']),
  email: z.string().trim().email().max(200).transform(value => value.toLowerCase()),
  password: z.string().min(1).max(1024),
  returnTo: z.string().max(500).optional()
});

export async function POST(req: Request) {
  try {
    requireSameOrigin(req);
    const auth = createCustomerAuth(req);
    const input = credentials.safeParse(await readJson(req, 6000));
    if (!input.success) throw new HttpError(400, 'Enter your email address and password.');
    const {action, email, password, returnTo} = input.data;
    if (action === 'signup' && (password.length < 8 || new TextEncoder().encode(password).length > 72)) {
      throw new HttpError(400, 'Use a password with at least 8 characters and at most 72 bytes.');
    }
    const ip = await emailHash(req.headers.get('cf-connecting-ip') || 'unknown');
    if (!await consumeRate('password:' + action + ':ip:' + ip, action === 'signup' ? 25 : 100) ||
        !await consumeRate('password:' + action + ':address:' + await emailHash(email), action === 'signup' ? 8 : 30)) {
      throw new HttpError(429, 'Please wait before trying again.');
    }
    if (action === 'signup') {
      await registerPasswordCustomer(email, password);
      try {
        await passwordSignIn(auth, email, password);
      } catch {
        return auth.finish(json({ok: true, next: 'signin'}, 201));
      }
      return auth.finish(json({ok: true, redirect: customerReturn(returnTo)}, 201));
    }
    await passwordSignIn(auth, email, password);
    return auth.finish(json({ok: true, redirect: customerReturn(returnTo)}));
  } catch (error) {
    return json({error: error instanceof HttpError ? error.message : 'Account access is temporarily unavailable. Please try again.'},
      error instanceof HttpError ? error.status : 503);
  }
}
