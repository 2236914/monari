'use client';

import Link from 'next/link';
import { Check, MessageCircle } from 'lucide-react';
import { usePlanByToken, useStore } from '@/lib/store';
import { MediaView } from '../MediaView';
import { Icon } from '../ui/Icon';
import { LogoTile } from '../ui/Avatars';
import { StatusTag } from '../ui/StatusTag';
import styles from './client.module.css';

export function ClientDone({ token }: { token: string }) {
  const { state } = useStore();
  const { link, plan, brand } = usePlanByToken(token);
  if (!link || !plan || !brand) return null;

  const approved = plan.posts.filter((p) => p.status === 'approved' || p.status === 'scheduled').length;
  const changes = plan.posts.filter((p) => p.status === 'changes').length;
  const waiting = plan.posts.length - approved - changes;
  const comments = state.threads.filter((t) => t.planId === plan.id && t.visibility === 'client').reduce((n, t) => n + t.comments.length, 0);
  const firstName = state.guestName ?? 'there';

  return (
    <div className={styles.column} style={{ background: 'var(--bg)' }}>
      <section className={styles.hero}>
        <span className="row gap-3">
          <span style={{ outline: '1px solid var(--on-primary)', display: 'inline-flex' }}><LogoTile name={state.branding.name} /></span>
          <span className="t-meta">{plan.name} · {brand.name}</span>
        </span>
        <h1 className="t-display">{waiting ? 'Thanks for reviewing' : 'All posts reviewed'}</h1>
        <p>
          Thanks, {firstName}. {state.branding.name} has your feedback and will let you know when the changes are ready.
          {waiting ? ` ${waiting} ${waiting === 1 ? 'post is' : 'posts are'} still waiting for you.` : ''}
        </p>
      </section>

      <div className="stack gap-6" style={{ padding: 24, flex: 1 }}>
        <ul className={styles.summary}>
          <li><StatusTag status="approved" /><span className="t-meta">{approved} posts</span></li>
          <li><StatusTag status="changes" /><span className="t-meta">{changes} posts</span></li>
          <li><span className="row gap-2"><Icon icon={MessageCircle} />Comments</span><span className="t-meta">{comments}</span></li>
        </ul>

        <div className="stack gap-2">
          <span className="label">Your review</span>
          <div className={styles.miniGrid}>
            {plan.posts.map((p) => (
              <Link key={p.id} href={`/s/${token}/p/${p.id}`} style={{ position: 'relative', display: 'block' }} aria-label={`Open post, ${p.status}`}>
                <MediaView media={p.slides[p.coverIndex] ?? p.slides[0]} />
                {(p.status === 'approved' || p.status === 'scheduled') && (
                  <span className={`${styles.marker} ${styles.markerSm} ${styles.markerApproved}`} style={{ position: 'absolute', left: 3, bottom: 3 }}><Icon icon={Check} size={12} /></span>
                )}
                {p.status === 'changes' && (
                  <span className={`${styles.marker} ${styles.markerSm} ${styles.markerChanges}`} style={{ position: 'absolute', left: 3, bottom: 3, fontSize: 10, fontWeight: 700 }}>!</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="stack gap-3" style={{ marginTop: 'auto' }}>
          <Link href={`/s/${token}`} className="btn btn-lg btn-block">Back to the grid</Link>
          <span className="t-small ink-3" style={{ textAlign: 'center' }}>
            {link.expires ? `This link stays open until ${link.expires}. ` : ''}Come back any time to see the updates.
          </span>
        </div>
      </div>
    </div>
  );
}
