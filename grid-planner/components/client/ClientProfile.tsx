'use client';

import Link from 'next/link';
import { ArrowRight, Check, CircleHelp, MessageCircle } from 'lucide-react';
import { usePlanByToken, useStore } from '@/lib/store';
import { isReviewed, postNumber, typeText } from '@/lib/status';
import { CroppedMedia } from '../MediaView';
import { IgOverlayIcon, IgProfileHeader } from '../InstagramProfile';
import { Icon } from '../ui/Icon';
import { LogoTile } from '../ui/Avatars';
import styles from './client.module.css';

export function ClientProfile({ token }: { token: string }) {
  const { state } = useStore();
  const { link, plan, brand } = usePlanByToken(token);
  if (!plan || !brand || !link) return null;

  const total = plan.posts.length;
  const reviewed = plan.posts.filter((p) => isReviewed(p.status)).length;
  const next = plan.posts.find((p) => !isReviewed(p.status));
  const clientThreads = state.threads.filter((t) => t.planId === plan.id && t.visibility === 'client' && t.status === 'open');
  const approveMode = link.mode === 'approve';

  return (
    <div className={styles.column}>
      <header className={styles.topbar}>
        <LogoTile name={state.branding.name} />
        <div className="stack grow">
          <span className="t-strong">{plan.name}</span>
          <span className="t-meta ink-3">{brand.name} · shared by {state.branding.name}</span>
        </div>
        <button type="button" className="btn btn-quiet btn-icon btn-touch" aria-label="How reviewing works" title="Tap a post to see it full size, swipe through slides, then comment, request changes or approve.">
          <Icon icon={CircleHelp} size={20} />
        </button>
      </header>

      <div className={styles.ig}>
        <IgProfileHeader brand={brand} postCount={total} variant="mobile" />

        {approveMode && (
          <div className={styles.legend}>
            <span className="row gap-1"><span className={`${styles.marker} ${styles.markerSm} ${styles.markerApproved}`}><Icon icon={Check} size={12} /></span>Approved</span>
            <span className="row gap-1"><span className={`${styles.marker} ${styles.markerSm} ${styles.markerChanges}`} style={{ fontWeight: 700, fontSize: 10 }}>!</span>Changes</span>
            <span className="row gap-1"><Icon icon={MessageCircle} size={12} />Comments</span>
            <span style={{ marginLeft: 'auto' }}>Tap a post to review</span>
          </div>
        )}

        <div className={styles.miniGrid} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {plan.posts.map((p, i) => {
            const n = clientThreads.filter((t) => t.postId === p.id).length;
            const label = [
              `Post ${postNumber(i, total)}`,
              typeText(p),
              p.status === 'approved' || p.status === 'scheduled' ? 'approved' : p.status === 'changes' ? 'changes requested' : 'not reviewed yet',
              n ? `${n} comments` : '',
            ].filter(Boolean).join(', ');
            return (
              <Link key={p.id} href={`/s/${token}/p/${p.id}`} className={styles.tile} aria-label={label}>
                <CroppedMedia media={p.slides[p.coverIndex] ?? p.slides[0]} />
                {p.type !== 'post' && <IgOverlayIcon type={p.type} />}
                {approveMode && (
                  <span className={styles.tileMarkers} aria-hidden="true">
                    {(p.status === 'approved' || p.status === 'scheduled') && <span className={`${styles.marker} ${styles.markerApproved}`}><Icon icon={Check} size={12} /></span>}
                    {p.status === 'changes' && <span className={`${styles.marker} ${styles.markerChanges}`} style={{ fontWeight: 700, fontSize: 12 }}>!</span>}
                    {n > 0 && <span className={`${styles.marker} ${styles.markerComments}`}><Icon icon={MessageCircle} size={12} />{n}</span>}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div style={{ height: 24 }} />
      </div>

      {approveMode && (
        <div className={styles.dock}>
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <span className="t-strong">{reviewed} of {total} reviewed</span>
            <span className="t-meta ink-3">{total - reviewed ? `${total - reviewed} to go` : 'All done'}</span>
          </div>
          <progress className={`progress ${styles.brandProgress}`} value={reviewed} max={total} aria-label="Review progress">{reviewed} of {total}</progress>
          {next ? (
            <Link href={`/s/${token}/p/${next.id}`} className="btn btn-brand btn-lg btn-block">Review next post<Icon icon={ArrowRight} /></Link>
          ) : (
            <Link href={`/s/${token}/done`} className="btn btn-brand btn-lg btn-block">See your summary<Icon icon={ArrowRight} /></Link>
          )}
        </div>
      )}
    </div>
  );
}
