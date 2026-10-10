'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Mail, Plus } from 'lucide-react';
import { AuthHeading, AuthShell, IconSquare } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/Icon';
import { PasswordField, TextField, emailError } from '@/components/ui/Field';
import styles from './signup.module.css';

const STEPS = [
  { title: 'Create an account', text: 'Your name, email and a password.' },
  { title: 'Confirm your email', text: 'One click on the link we send you.' },
  { title: 'Name your workspace', text: 'Usually your agency. Invite your team.' },
  { title: 'Add your first brand', text: "A client's Instagram account and its grid." },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [invites, setInvites] = useState('');
  const [tried1, setTried1] = useState(false);
  const [tried3, setTried3] = useState(false);
  const [resent, setResent] = useState(false);

  const nameErr = tried1 && !name.trim() ? 'Error: Enter your name.' : null;
  const emailErr = tried1 ? emailError(email, 'Error: Enter your work email.') : null;
  const pwErr = tried1 && password.length < 8 ? 'Error: Use at least 8 characters.' : null;
  const wsErr = tried3 && !workspace.trim() ? 'Error: Give your workspace a name.' : null;
  const shownEmail = email.trim() || 'you@agency.com';

  const steps = (
    <ol className={styles.steps}>
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={s.title} className={styles.step} aria-current={current ? 'step' : undefined}>
            <span className={`${styles.mark} ${n <= step ? styles.markOn : ''}`}>
              {done ? <Icon icon={Check} size={12} /> : n}
            </span>
            <span className="stack">
              <span className="t-strong">{s.title}</span>
              <span className="t-small">{s.text}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );

  return (
    <AuthShell
      aside={steps}
      headline="Your first approved grid, today."
      body="Set up your workspace, add a brand and send the client one link. No more approvals in chat threads."
    >
      {step === 1 && (
        <form
          noValidate
          className="stack gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried1(true);
            if (name.trim() && !emailError(email) && password.length >= 8) {
              setStep(2);
              setTried1(false);
            }
          }}
        >
          <AuthHeading eyebrow="Step 1 of 4" title="Create an account">Free for 14 days. No card needed.</AuthHeading>
          <button type="button" className="btn btn-lg btn-block" onClick={() => setStep(3)}>Continue with Google</button>
          <div className="or-divider" aria-hidden="true">or</div>
          <TextField id="name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={nameErr} />
          <TextField id="email" label="Work email" type="email" autoComplete="email" placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} error={emailErr} />
          <PasswordField id="password" label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={pwErr} hint="At least 8 characters." />
          <button type="submit" className="btn btn-primary btn-lg btn-block">Create account</button>
          <p className="t-small ink-3">By creating an account you agree to the <a href="#terms" className="ink-2">Terms</a> and <a href="#privacy" className="ink-2">Privacy policy</a>.</p>
          <p className="t-small ink-2">Already have an account? <Link href="/sign-in" className="t-strong">Sign in</Link></p>
        </form>
      )}

      {step === 2 && (
        <div className="stack gap-6">
          <IconSquare><Icon icon={Mail} size={20} /></IconSquare>
          <AuthHeading eyebrow="Step 2 of 4" title="Confirm your email">
            We sent a link to <strong style={{ color: 'var(--ink)' }}>{shownEmail}</strong>. Open it to keep going. You can leave this tab open.
          </AuthHeading>
          <div className="callout">Can&apos;t find it? Check spam and promotions. The link works for 24 hours.</div>
          <div className="stack gap-2">
            <button type="button" className="btn btn-lg btn-block" onClick={() => setResent(true)}>Resend email</button>
            {resent && <span role="status" className="row gap-2 t-small"><Icon icon={Check} size={16} />Sent again to {shownEmail}.</span>}
          </div>
          <p className="t-small ink-2">Wrong email? <button type="button" className="btn-link t-strong" onClick={() => { setStep(1); setResent(false); }}>Change it</button></p>
          <p className="t-small ink-3">Prototype: <button type="button" className="btn-link ink-2" onClick={() => setStep(3)}>open the link from the email</button></p>
        </div>
      )}

      {step === 3 && (
        <form
          noValidate
          className="stack gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried3(true);
            if (workspace.trim()) setStep(4);
          }}
        >
          <AuthHeading eyebrow={<span className="row gap-1"><Icon icon={Check} size={12} />Email confirmed · Step 3 of 4</span>} title="Name your workspace">
            A workspace holds your team, your client brands and billing.
          </AuthHeading>
          <TextField id="workspace" label="Workspace name" placeholder="Morpho" value={workspace} onChange={(e) => setWorkspace(e.target.value)} error={wsErr} hint="Usually your agency's name. You can change it later." />
          <div className="field">
            <label htmlFor="invites" className="label">Invite teammates (optional)</label>
            <textarea id="invites" className="input" rows={3} placeholder="maya@agency.com, mateo@agency.com" value={invites} onChange={(e) => setInvites(e.target.value)} aria-describedby="invites-hint" />
            <span id="invites-hint" className="hint">They join as Members and can upload, write captions and resolve comments.</span>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block">Create workspace</button>
        </form>
      )}

      {step === 4 && (
        <div className="stack gap-6">
          <AuthHeading eyebrow="Step 4 of 4" title={`${workspace.trim() || 'Your workspace'} is ready`}>
            Add your first brand. Each brand is one client&apos;s Instagram account.
          </AuthHeading>
          <ol className={styles.checklist}>
            <li><span className={styles.doneBox}><Icon icon={Check} size={12} /></span>Create your workspace</li>
            <li><span className={styles.todoBox}>2</span>Add a brand</li>
            <li><span className={styles.todoBox}>3</span>Upload posts</li>
            <li><span className={styles.todoBox}>4</span>Share for review</li>
          </ol>
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => router.push('/brands')}><Icon icon={Plus} />Add your first brand</button>
          <Link href="/dashboard" className="t-small ink-2" style={{ alignSelf: 'center' }}>Skip for now</Link>
        </div>
      )}
    </AuthShell>
  );
}
