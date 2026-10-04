'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronRight, Hash, Link2, MessageCircle, Upload } from 'lucide-react';
import { usePlan, useStore } from '@/lib/store';
import { STATUS_ORDER } from '@/lib/status';
import type { Ratio } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { StatusTag } from '@/components/ui/StatusTag';
import { IgProfileHeader } from '@/components/InstagramProfile';
import { PlannerGrid } from '@/components/planner/PlannerGrid';
import { PostPanel } from '@/components/planner/PostPanel';
import { ShareDialog } from '@/components/planner/ShareDialog';
import styles from './planner.module.css';

export function Planner({ planId, openShare }: { planId: string; openShare: boolean }) {
  const { state, actions } = useStore();
  const { plan, brand } = usePlan(planId);
  const [selectedId, setSelectedId] = useState<string | null>(plan?.posts[4]?.id ?? plan?.posts[0]?.id ?? null);
  const [showNumbers, setShowNumbers] = useState(true);
  const [shareOpen, setShareOpen] = useState(openShare);

  const threads = useMemo(() => state.threads.filter((t) => t.planId === planId), [state.threads, planId]);
  const commentCounts = useMemo(() => {
    const m: Record<string, number> = {};
    threads.filter((t) => t.status === 'open' && t.visibility === 'client').forEach((t) => { m[t.postId] = (m[t.postId] ?? 0) + 1; });
    return m;
  }, [threads]);

  if (!plan || !brand) {
    return (
      <main className="container" style={{ padding: '48px 24px' }}>
        <h1 className="t-display">Plan not found</h1>
        <p className="ink-2" style={{ marginTop: 8 }}>It may have been deleted. <Link href="/brands">Back to brands</Link></p>
      </main>
    );
  }

  const index = plan.posts.findIndex((p) => p.id === selectedId);
  const selected = index >= 0 ? plan.posts[index] : null;
  const openThreads = threads.filter((t) => t.status === 'open').length;
  const summary = STATUS_ORDER.map((s) => ({ s, n: plan.posts.filter((p) => p.status === s).length }));

  return (
    <>
      <section className={styles.header}>
        <div className="stack gap-2" style={{ minWidth: 0 }}>
          <nav aria-label="Breadcrumb" className="row gap-1 t-small ink-2">
            <Link href="/brands" className={styles.crumb}>Morpho</Link>
            <Icon icon={ChevronRight} />
            <Link href="/brands" className={styles.crumb}>{brand.name}</Link>
          </nav>
          <h1 className="t-display">{plan.name}</h1>
          <span className="t-meta ink-3">@{brand.username} · {plan.posts.length} posts · Updated {plan.updated}</span>
        </div>
        <div className="row wrap gap-2">
          <Link href={`/plans/${plan.id}/upload`} className="btn"><Icon icon={Upload} />Upload posts</Link>
          <button type="button" className="btn btn-primary" onClick={() => setShareOpen(true)} disabled={!plan.posts.length}><Icon icon={Link2} />Share for review</button>
        </div>
      </section>

      <div className={styles.toolbar}>
        <ul aria-label="Status summary" className={styles.summary}>
          {summary.map(({ s, n }) => (
            <li key={s}><StatusTag status={s} /><span className="t-meta ink-2">{n}</span></li>
          ))}
        </ul>
        <div className="row wrap gap-2">
          <span className="label ink-3" id="ratio-label">Tile</span>
          <div className="seg" role="group" aria-labelledby="ratio-label">
            {(['3:4', '4:5', '1:1'] as Ratio[]).map((r) => (
              <button key={r} type="button" aria-pressed={plan.ratio === r} onClick={() => actions.setRatio(plan.id, r)}>{r}</button>
            ))}
          </div>
          <button type="button" className={`btn btn-sm ${showNumbers ? 'btn-primary' : ''}`} aria-pressed={showNumbers} onClick={() => setShowNumbers((v) => !v)}>
            <Icon icon={Hash} />Posting order
          </button>
          <Link href={`/plans/${plan.id}/posts/${selected?.id ?? plan.posts[0]?.id ?? ''}`} className="btn btn-sm">
            <Icon icon={MessageCircle} />Comments<span className="t-meta ink-3" style={{ fontWeight: 400 }}>{openThreads} open</span>
          </Link>
        </div>
      </div>

      <div className={styles.body}>
        <main className={styles.canvas}>
          {plan.posts.length === 0 ? (
            <div className={styles.empty}>
              <h2 className="t-title">No posts yet</h2>
              <p className="ink-2">Upload images and videos to start the grid.</p>
              <Link href={`/plans/${plan.id}/upload`} className="btn btn-primary btn-lg"><Icon icon={Upload} />Upload posts</Link>
            </div>
          ) : (
            <>
              <div className={styles.hintRow}>
                <span className="t-small ink-2">Drag tiles to reorder. The top-left post is the newest. On touch, hold a tile, then drag.</span>
                <span className="t-meta ink-3">{plan.ratio} tiles · 2px gaps</span>
              </div>
              <div className={styles.phone}>
                <IgProfileHeader brand={brand} postCount={plan.posts.length} variant="desktop" />
                <PlannerGrid
                  posts={plan.posts}
                  ratio={plan.ratio}
                  showNumbers={showNumbers}
                  selectedId={selectedId}
                  commentCounts={commentCounts}
                  onSelect={setSelectedId}
                  onReorder={(from, to) => actions.reorder(plan.id, from, to)}
                />
              </div>
            </>
          )}
        </main>

        {selected && (
          <PostPanel
            key={selected.id}
            plan={plan}
            post={selected}
            index={index}
            threads={threads.filter((t) => t.postId === selected.id)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      <ShareDialog plan={plan} brand={brand} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
