'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { AuthHeading, AuthShell, IconSquare } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/Icon';

export default function VerifyEmailPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [resent, setResent] = useState(false);
  return (
    <AuthShell
      headline="One click and you're in."
      body="Confirming your email keeps client approvals and comment notifications going to the right inbox."
    >
      {!confirmed ? (
        <>
          <IconSquare><Icon icon={Mail} size={20} /></IconSquare>
          <AuthHeading eyebrow="Step 2 of 4" title="Confirm your email">
            We sent a link to <strong style={{ color: 'var(--ink)' }}>sean@morpho.studio</strong>. Open it to finish setting up your workspace.
          </AuthHeading>
          <div className="callout">Can&apos;t find it? Check spam and promotions. The link works for 24 hours.</div>
          <div className="stack gap-2">
            <button type="button" className="btn btn-lg btn-block" onClick={() => setResent(true)}>Resend email</button>
            {resent && <span role="status" className="row gap-2 t-small"><Icon icon={Check} />Sent again to sean@morpho.studio.</span>}
          </div>
          <p className="t-small ink-2">Wrong email? <Link href="/sign-up" className="t-strong">Change it</Link></p>
          <p className="t-small ink-3">Prototype: <button type="button" className="btn-link ink-2" onClick={() => setConfirmed(true)}>open the link from the email</button></p>
        </>
      ) : (
        <>
          <IconSquare><Icon icon={Check} size={20} /></IconSquare>
          <AuthHeading title="Email confirmed">Next, name your workspace. It takes a few seconds.</AuthHeading>
          <Link href="/sign-up" className="btn btn-primary btn-lg btn-block">Continue<Icon icon={ArrowRight} /></Link>
        </>
      )}
    </AuthShell>
  );
}
