'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { AuthHeading, IconSquare } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/Icon';
import styles from './reset.module.css';

export function ResetForm({ expired }: { expired: boolean }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  if (expired) {
    return (
      <>
        <IconSquare tone="outline"><Icon icon={TriangleAlert} size={20} /></IconSquare>
        <AuthHeading title="This link has expired">Reset links work for one hour and only once. Ask for a new one and use the latest email.</AuthHeading>
        <Link href="/forgot-password" className="btn btn-primary btn-lg btn-block">Send a new link</Link>
        <Link href="/sign-in" className="t-small ink-2" style={{ alignSelf: 'center' }}>Back to sign in</Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <IconSquare><Icon icon={Check} size={20} /></IconSquare>
        <AuthHeading title="Password updated">Sign in with your new password. You&apos;ve been signed out everywhere else.</AuthHeading>
        <Link href="/sign-in" className="btn btn-primary btn-lg btn-block">Sign in</Link>
      </>
    );
  }

  const longEnough = pw.length >= 8;
  const match = pw.length > 0 && pw === pw2;
  const rules = [
    { met: longEnough, text: 'At least 8 characters' },
    { met: match, text: 'Both passwords match' },
  ];

  return (
    <form
      noValidate
      className="stack gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (longEnough && match) setDone(true);
      }}
    >
      <AuthHeading title="Set a new password">For <strong style={{ color: 'var(--ink)' }}>sean@morpho.studio</strong></AuthHeading>
      <div className="field">
        <label htmlFor="pw" className="label">New password</label>
        <input id="pw" type="password" autoComplete="new-password" className="input input-touch" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={tried && !longEnough ? true : undefined} aria-describedby="pw-rules" />
      </div>
      <div className="field">
        <label htmlFor="pw2" className="label">Confirm new password</label>
        <input id="pw2" type="password" autoComplete="new-password" className="input input-touch" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={tried && !match ? true : undefined} aria-describedby="pw-rules" />
      </div>
      <ul id="pw-rules" className={styles.rules}>
        {rules.map((r) => {
          const failed = tried && !r.met;
          return (
            <li key={r.text} className={r.met || failed ? styles.strong : undefined}>
              <span className={`${styles.box} ${r.met ? styles.met : failed ? styles.failed : ''}`}>
                {r.met && <Icon icon={Check} size={12} />}
              </span>
              <span>{failed ? 'Error: ' : ''}{r.text}</span>
            </li>
          );
        })}
      </ul>
      <button type="submit" className="btn btn-primary btn-lg btn-block">Save new password</button>
    </form>
  );
}
