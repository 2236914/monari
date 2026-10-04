'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { AuthHeading, IconSquare } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/Icon';
import { PasswordField, TextField } from '@/components/ui/Field';

export function InviteForm({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [name, setName] = useState('Maya');
  const [pw, setPw] = useState('');
  const [tried, setTried] = useState(false);

  if (expired) {
    return (
      <>
        <IconSquare tone="outline"><Icon icon={TriangleAlert} size={20} /></IconSquare>
        <AuthHeading title="This invite has expired">Invites last 7 days. Ask Sean to send you a new one from Team settings.</AuthHeading>
        <Link href="/sign-in" className="btn btn-lg btn-block">Go to sign in</Link>
      </>
    );
  }

  const nameErr = tried && !name.trim() ? 'Error: Enter your name.' : null;
  const pwErr = tried && pw.length < 8 ? 'Error: Use at least 8 characters.' : null;

  return (
    <form
      noValidate
      className="stack gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (name.trim() && pw.length >= 8) router.push('/dashboard');
      }}
    >
      <AuthHeading eyebrow="Invite from Sean · expires 10 Oct" title="Join Morpho">Sean invited you to the Morpho workspace as a Member.</AuthHeading>
      <button type="button" className="btn btn-lg btn-block" onClick={() => router.push('/dashboard')}>Continue with Google</button>
      <div className="or-divider" aria-hidden="true">or</div>
      <TextField id="email" label="Email" type="email" value="maya@morpho.studio" disabled readOnly hint="The invite is tied to this address." />
      <TextField id="name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={nameErr} />
      <PasswordField id="password" label="Password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={pwErr} hint="At least 8 characters." />
      <button type="submit" className="btn btn-primary btn-lg btn-block">Join Morpho</button>
      <p className="t-small ink-2">Already have an account? <Link href="/sign-in" className="t-strong">Sign in to accept</Link></p>
    </form>
  );
}
