import {createServerClient} from '@supabase/ssr';
import type {Session, User} from '@supabase/supabase-js';
import {decodeJwt} from 'jose';
import {z} from 'zod';
import {runtime} from './runtime';
import {activeAuthSession, getRecord, insertRecord, deleteRecord} from './data';
import {HttpError} from '../http';
import {revokeEmailSession, emailHash, type EmailAuth} from './email-sessions';
import {CUSTOMER_COOKIE} from '../customer-auth-policy';

const nativeCookie = CUSTOMER_COOKIE + '.password';
const eightHours = 8 * 60 * 60;
const uuid = z.string().uuid();

function isPasswordCookie(name: string) {
  return name === nativeCookie || /^__Host-ws-customer-auth\.password\.\d+$/.test(name);
}

function passwordClient(auth: EmailAuth) {
  const env = runtime();
  if (auth.scope !== 'customer' || !env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new HttpError(503, 'Account access is temporarily unavailable. Please try again.');
  }
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {detectSessionInUrl: false},
    cookieOptions: {name: nativeCookie, path: '/', secure: true, httpOnly: true, sameSite: 'lax'},
    cookies: {
      getAll: () => auth.cookies().filter(cookie => isPasswordCookie(cookie.name)),
      setAll: changes => {
        for (const cookie of changes) {
          if (isPasswordCookie(cookie.name)) {
            auth.set(cookie.name, cookie.value, {maxAge: cookie.value && cookie.options.maxAge !== 0 ? eightHours : 0});
          }
        }
      }
    }
  });
}

function sessionId(session: Session, user: User) {
  const claims = decodeJwt(session.access_token);
  if (claims.sub !== user.id || !uuid.safeParse(claims.session_id).success) {
    throw new HttpError(401, 'Please sign in again.');
  }
  return claims.session_id as string;
}

export async function passwordSignIn(auth: EmailAuth, email: string, password: string) {
  const client = passwordClient(auth);
  const {data, error} = await client.auth.signInWithPassword({email, password});
  if (error || !data.session || !data.user?.email) {
    if (error?.status === 429) throw new HttpError(429, 'Please wait a moment before trying again.');
    if (error?.status && error.status >= 500) throw new HttpError(503, 'Sign-in is temporarily unavailable. Please try again.');
    throw new HttpError(401, 'The email or password is incorrect.');
  }
  const owner = 'customer:' + data.user.id;
  const id = sessionId(data.session, data.user);
  try {
    const legacy = await getRecord('email-user:' + await emailHash(data.user.email), 'setting');
    if (legacy?.data.id === data.user.id && legacy.data.disabledAt) throw new HttpError(403, 'Please contact the atelier about this account.');
    await revokeEmailSession(auth);
    if (auth.hasSession) auth.set(auth.name, '', {maxAge: 0});
    const now = Date.now();
    if (!await insertRecord('password-session:' + id, 'setting', owner, {
      origin: auth.config.site, createdAt: now, expiresAt: now + eightHours * 1000
    })) throw Error('Session already bound');
    await insertRecord('profile:' + owner, 'setting', owner, {
      email: data.user.email, displayName: data.user.email, joinedAt: new Date(now).toISOString()
    });
  } catch (error) {
    await client.auth.signOut({scope: 'local'}).catch(() => undefined);
    throw error;
  }
}

export async function passwordCustomer(auth: EmailAuth) {
  if (!auth.cookies().some(cookie => isPasswordCookie(cookie.name) && cookie.value)) return null;
  const client = passwordClient(auth);
  const {data: {session}} = await client.auth.getSession();
  if (!session) return null;
  // Verify the token with its issuer before using any claims read from cookies.
  const {data: {user}, error} = await client.auth.getUser(session.access_token);
  if (error || !user?.email) return null;
  const id = sessionId(session, user);
  const owner = 'customer:' + user.id;
  const binding = await getRecord('password-session:' + id, 'setting');
  const now = Date.now();
  if (!binding || binding.owner !== owner || binding.data.origin !== auth.config.site ||
      !Number.isSafeInteger(binding.data.createdAt) || !Number.isSafeInteger(binding.data.expiresAt) ||
      binding.data.expiresAt <= now || binding.data.createdAt > now + 1000 ||
      binding.data.expiresAt - binding.data.createdAt > eightHours * 1000 ||
      !await activeAuthSession(id, user.id)) return null;
  return {userId: owner, email: user.email, displayName: user.email, fullName: null};
}

export async function passwordSignOut(auth: EmailAuth) {
  if (!auth.cookies().some(cookie => isPasswordCookie(cookie.name) && cookie.value)) return;
  const client = passwordClient(auth);
  const {data: {session}} = await client.auth.getSession();
  if (session) {
    const {data: {user}} = await client.auth.getUser(session.access_token);
    if (user) {
      const id = sessionId(session, user);
      const binding = await getRecord('password-session:' + id, 'setting');
      if (binding?.owner === 'customer:' + user.id && binding.data.origin === auth.config.site) {
        await deleteRecord(binding.id, binding.owner);
      }
    }
  }
  const {error} = await client.auth.signOut({scope: 'local'});
  if (error && error.status !== 401 && error.status !== 403) {
    throw new HttpError(503, 'Please try signing out again.');
  }
}
