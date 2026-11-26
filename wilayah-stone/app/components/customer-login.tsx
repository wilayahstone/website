'use client';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowRight, Eye, EyeOff, ShieldCheck} from 'lucide-react';
import {customerReturn} from '../../lib/customer-auth-policy';

export function CustomerLogin({returnTo='/account'}: {returnTo?: string}) {
  const [mode, setMode] = useState<'signup'|'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [next, setNext] = useState(customerReturn(returnTo));
  const passwordInput = useRef<HTMLInputElement>(null);
  const signingUp = mode === 'signup';

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setNext(customerReturn(query.get('next') || returnTo));
    if (query.get('mode') === 'signin' || query.get('auth_status') === 'signed_out') setMode('signin');
    if (query.get('auth_status') === 'signed_out') setNotice('You have signed out.');
  }, [returnTo]);

  function changeMode(value: 'signup'|'signin') {
    setMode(value);
    setPassword('');
    setVisible(false);
    setNotice('');
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/auth/customer', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({action: mode, email, password, returnTo: next})
      });
      const result = await response.json() as {ok?: boolean; error?: string; redirect?: string; next?: string};
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'Please try again.');
      if (result.next === 'signin') {
        changeMode('signin');
        setEmail(email.trim());
        setNotice('Your account is ready. Sign in to continue.');
        requestAnimationFrame(() => passwordInput.current?.focus());
      } else {
        window.location.assign(customerReturn(result.redirect));
      }
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="customer-login" aria-labelledby="customer-login-title">
    <div className="customer-login-intro">
      <span className="eyebrow">YOUR WILAYAH STONE ACCOUNT</span>
      <h2 id="customer-login-title">Keep what matters close.</h2>
      <p>Save your favourite rings, follow your requests and keep your conversations with the atelier together.</p>
      <span className="customer-login-security"><ShieldCheck size={18}/>Your personal atelier</span>
    </div>
    <div className="customer-login-form">
      <div className="account-modes" role="group" aria-label="Account access">
        <button type="button" disabled={busy} aria-pressed={signingUp} onClick={()=>changeMode('signup')}>Create account</button>
        <button type="button" disabled={busy} aria-pressed={!signingUp} onClick={()=>changeMode('signin')}>Sign in</button>
      </div>
      <form onSubmit={submit}>
        <h3>{signingUp?'Create your account.':'Welcome back.'}</h3>
        {notice&&<p className="notice-box" role="status">{notice}</p>}
        <label>Email address<input name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={200} value={email} onChange={event=>setEmail(event.target.value)}/></label>
        <label htmlFor="atelier-password">Password</label>
        <div className="account-password-field">
          <input id="atelier-password" name="password" type={visible?'text':'password'} ref={passwordInput} autoComplete={signingUp?'new-password':'current-password'} minLength={signingUp?8:1} maxLength={signingUp?72:1024} aria-describedby={signingUp?'password-guidance':undefined} required value={password} onChange={event=>setPassword(event.target.value)}/>
          <button type="button" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>
        </div>
        {signingUp&&<small id="password-guidance">Use at least 8 characters.</small>}
        {error&&<p className="contact-form-error" role="alert">{error}</p>}
        <button className="primary full" type="submit" disabled={busy}>{busy?(signingUp?'Creating account…':'Signing in…'):(signingUp?'Create account':'Sign in')}<ArrowRight size={17}/></button>
      </form>
      <small>By continuing, you agree to our <a href="/terms">terms</a> and acknowledge our <a href="/privacy">privacy notice</a>.</small>
    </div>
  </section>;
}
export function CustomerSignOut({onSignedOut, className='text-link'}: {
  onSignedOut: () => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/auth/customer/signout', {method:'POST'});
      if (!response.ok) throw new Error('Please try signing out again.');
      onSignedOut();
      window.location.replace('/account?mode=signin&auth_status=signed_out');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Please try again.');
      setBusy(false);
    }
  }
  return <div className="customer-signout">
    <button className={className} type="button" disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'}</button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
