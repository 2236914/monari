'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, ExternalLink, Link2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Brand, Plan, ShareLink } from '@/lib/types';
import { MediaView } from '../MediaView';
import { Icon } from '../ui/Icon';
import styles from './ShareDialog.module.css';

function randomToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function ShareDialog({ plan, brand, open, onClose }: { plan: Plan; brand: Brand; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { state, actions } = useStore();
  const [mode, setMode] = useState<ShareLink['mode']>('approve');
  const [allowComments, setAllowComments] = useState(true);
  const [password, setPassword] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const [expires, setExpires] = useState(true);
  const [expiry, setExpiry] = useState('2026-10-31');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const links = useMemo(() => state.links.filter((l) => l.planId === plan.id), [state.links, plan.id]);
  const active = links.find((l) => !l.revoked);
  const url = active ? `${origin}/s/${active.token}` : '';
  const ogTiles = plan.posts.slice(0, 9);

  function create() {
    actions.addLink({
      planId: plan.id,
      token: randomToken(),
      mode,
      allowComments,
      password,
      expires: expires ? new Date(expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null,
      views: 0,
      created: 'today',
      revoked: null,
    });
    setCopied(false);
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the field stays selectable */
    }
  }

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="share-title" onClose={onClose} onCancel={onClose}>
      <div className={styles.head}>
        <div className="stack gap-1">
          <h2 id="share-title" className="t-title">Share for review</h2>
          <span className="t-meta ink-3">{plan.name} · {plan.posts.length} posts · @{brand.username}</span>
        </div>
        <button type="button" className="btn btn-quiet btn-icon" aria-label="Close" onClick={onClose}><Icon icon={X} size={20} /></button>
      </div>

      <div className={styles.preview}>
        <div className={styles.og} aria-hidden="true">
          {ogTiles.map((p) => <MediaView key={p.id} media={p.slides[p.coverIndex] ?? p.slides[0]} />)}
        </div>
        <div className="stack gap-1" style={{ minWidth: 0 }}>
          <span className="label">Link preview</span>
          <span className="t-strong">{brand.username} · {plan.name}</span>
          <span className="t-small ink-2">{plan.posts.length} posts to review. Shared by {state.branding.name}.</span>
          <span className="t-small ink-3" style={{ marginTop: 8 }}>This is how the link shows up in WhatsApp, iMessage and email. The grid image updates when you reorder.</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className="field">
          <span id="access-label" className="label">Access</span>
          <div className="seg seg-block seg-lg" role="group" aria-labelledby="access-label">
            <button type="button" aria-pressed={mode === 'view'} onClick={() => setMode('view')}>View only</button>
            <button type="button" aria-pressed={mode === 'approve'} onClick={() => setMode('approve')}>View and approve</button>
          </div>
          <span className="hint">{mode === 'approve' ? 'Clients can approve or request changes, post by post.' : 'Clients can see the grid and captions but cannot approve.'}</span>
        </div>

        <div className={styles.options}>
          <div className={styles.option}>
            <input id="opt-comments" type="checkbox" className="check" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
            <div className="stack" style={{ gap: 2 }}>
              <label htmlFor="opt-comments" className="t-strong">Allow comments</label>
              <span className="hint">Clients can pin a comment to a spot on any slide.</span>
            </div>
          </div>
          <div className={styles.option}>
            <input id="opt-password" type="checkbox" className="check" checked={password} onChange={(e) => setPassword(e.target.checked)} />
            <div className="stack grow" style={{ gap: 2 }}>
              <label htmlFor="opt-password" className="t-strong">Require a password</label>
              <span className="hint">Send the password separately from the link.</span>
              {password && <input type="text" aria-label="Password" className="input" style={{ marginTop: 8 }} placeholder="Choose a password" value={pwValue} onChange={(e) => setPwValue(e.target.value)} />}
            </div>
          </div>
          <div className={styles.option}>
            <input id="opt-expiry" type="checkbox" className="check" checked={expires} onChange={(e) => setExpires(e.target.checked)} />
            <div className="stack grow" style={{ gap: 2 }}>
              <label htmlFor="opt-expiry" className="t-strong">Link expires</label>
              <span className="hint">After this date the link shows an expired page.</span>
              {expires && (
                <span className="row gap-2" style={{ marginTop: 8 }}>
                  <Icon icon={Calendar} />
                  <input type="date" aria-label="Expiry date" className="input" style={{ width: 200 }} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="share-url" className="label">Link</label>
          <div className="row gap-2">
            <input id="share-url" className={`input ${styles.url}`} readOnly value={url || 'Create a link to get a URL'} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn" onClick={copy} disabled={!url}><Icon icon={copied ? Check : Link2} />{copied ? 'Copied' : 'Copy link'}</button>
          </div>
          <span className="hint">Anyone with the link can open it without an account. Revoke it any time.</span>
          {active && <Link href={`/s/${active.token}`} target="_blank" className="row gap-2 t-small ink-2"><Icon icon={ExternalLink} />Open the client view</Link>}
        </div>

        <div className="field">
          <span className="label">Links for this plan</span>
          <div className="card">
            {links.length === 0 && <div style={{ padding: '12px 16px' }} className="t-small ink-3">No links yet.</div>}
            {links.map((l) => (
              <div key={l.id} className={styles.linkRow}>
                <div className="stack grow" style={{ gap: 2 }}>
                  <span className={`t-strong ${l.revoked ? 'ink-3' : ''}`}>{l.mode === 'approve' ? 'View and approve' : 'View only'}</span>
                  <span className="t-meta ink-3">
                    {l.revoked ? `Revoked ${l.revoked} · ${l.views} views` : `Created ${l.created} · ${l.views} views${l.expires ? ` · Expires ${l.expires}` : ''}`}
                  </span>
                </div>
                {l.revoked ? <span className="label ink-3">Revoked</span> : <button type="button" className="btn btn-sm btn-quiet" onClick={() => actions.revokeLink(l.id)}>Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.foot}>
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={create}><Icon icon={Link2} />{active ? 'Create a new link' : 'Create link'}</button>
      </div>
    </dialog>
  );
}
