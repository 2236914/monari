'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthHeading, AuthShell } from '@/components/auth/AuthShell';
import { PasswordField, TextField, emailError } from '@/components/ui/Field';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const eErr = submitted ? emailError(email) : null;
  const pErr = submitted && !password ? 'Error: Enter your password.' : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!emailError(email) && password) router.push('/dashboard');
  }

  return (
    <AuthShell
      showGrid
      headline="Plan the grid. Get it approved."
      body="One link for your client: the profile as it will look, comments pinned to the exact spot, and approval post by post."
    >
      <form onSubmit={submit} noValidate className="stack gap-6">
        <AuthHeading title="Sign in">Welcome back. Your brands and plans are where you left them.</AuthHeading>
        <button type="button" className="btn btn-lg btn-block" onClick={() => router.push('/dashboard')}>Continue with Google</button>
        <div className="or-divider" aria-hidden="true">or</div>
        <TextField id="email" label="Email" type="email" autoComplete="email" placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} error={eErr} />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={pErr}
          labelAside={<Link href="/forgot-password" className="t-small ink-2">Forgot password?</Link>}
        />
        <button type="submit" className="btn btn-primary btn-lg btn-block">Sign in</button>
        <p className="t-small ink-2">New to Grid Planner? <Link href="/sign-up" className="t-strong">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
