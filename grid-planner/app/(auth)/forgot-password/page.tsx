'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check, Mail } from 'lucide-react';
import { AuthHeading, AuthShell, IconSquare } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/Icon';
import { TextField, emailError } from '@/components/ui/Field';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);
  const err = tried ? emailError(email) : null;

  return (
    <AuthShell
      headline="Locked out? It happens."
      body="We'll email you a link to set a new password. Your brands, plans and share links stay exactly as they are."
    >
      {!sent ? (
        <form
          noValidate
          className="stack gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!emailError(email)) setSent(true);
          }}
        >
          <Link href="/sign-in" className="btn btn-quiet btn-sm" style={{ alignSelf: 'flex-start', marginLeft: -12 }}><Icon icon={ArrowLeft} />Back to sign in</Link>
          <AuthHeading title="Reset your password">Enter the email you sign in with and we&apos;ll send you a reset link.</AuthHeading>
          <TextField id="email" label="Email" type="email" autoComplete="email" placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
          <button type="submit" className="btn btn-primary btn-lg btn-block"><Icon icon={Mail} />Send reset link</button>
        </form>
      ) : (
        <>
          <IconSquare><Icon icon={Mail} size={20} /></IconSquare>
          {/* Same message whether or not the account exists, so the form can't be used to find accounts. */}
          <AuthHeading title="Check your email">
            If <strong style={{ color: 'var(--ink)' }}>{email.trim()}</strong> has an account, a reset link is on its way. It works for one hour.
          </AuthHeading>
          <div className="callout">Can&apos;t find it? Check spam and promotions, or make sure you typed the email you signed up with.</div>
          <div className="stack gap-2">
            <button type="button" className="btn btn-lg btn-block" onClick={() => setResent(true)}>Resend link</button>
            {resent && <span role="status" className="row gap-2 t-small"><Icon icon={Check} />Sent again. Give it a minute.</span>}
          </div>
          <p className="t-small ink-2">
            <button type="button" className="btn-link" onClick={() => { setSent(false); setResent(false); }}>Use a different email</button>
            {' · '}
            <Link href="/sign-in">Back to sign in</Link>
          </p>
          <p className="t-small ink-3">Prototype: <Link href="/reset-password" className="ink-2">open the link from the email</Link></p>
        </>
      )}
    </AuthShell>
  );
}
