'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Ellipsis, Inbox, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Plan, Status } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { StatusTag } from '@/components/ui/StatusTag';
import { BrandAvatar } from '@/components/ui/Avatars';
import styles from './brands.module.css';

const BAR_ORDER: Status[] = ['approved', 'scheduled', 'review', 'changes', 'draft'];
const WORD: Record<Status, string> = { approved: 'approved', scheduled: 'scheduled', review: 'in review', changes: 'changes requested', draft: 'draft' };

function StatusBar({ plan }: { plan: Plan }) {
  const counts = BAR_ORDER.map((s) => ({ s, n: plan.posts.filter((p) => p.status === s).length })).filter((c) => c.n);
  if (!counts.length) return <span className="t-small ink-2">No posts yet. Upload to start the grid.</span>;
  return (
    <>
      <span aria-hidden="true" className={styles.bar}>
        {counts.map((c) => <span key={c.s} className={`${styles.seg} ${styles[c.s]}`} style={{ flexGrow: c.n }} />)}
      </span>
      <span className="t-small ink-2">{counts.map((c) => `${c.n} ${WORD[c.s]}`).join(' · ')}</span>
    </>
  );
}

export default function BrandsPage() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const brands = useMemo(
    () => state.brands.filter((b) => (b.name + b.username).toLowerCase().includes(q.trim().toLowerCase())),
    [state.brands, q],
  );
  const totalPosts = state.plans.reduce((n, p) => n + p.posts.length, 0);
  const changes = state.plans.flatMap((p) => p.posts).filter((p) => p.status === 'changes').length;

  const needs = [
    { brand: 'Halden Coffee', plan: 'October launch', status: 'changes' as Status, text: `Lina requested changes on ${changes} posts.`, cta: 'Open feedback', href: '/plans/october-launch/posts/single-origin' },
    { brand: 'Nori Ramen', plan: 'Winter menu', status: 'review' as Status, text: '4 posts have been in review for 3 days.', cta: 'Send a reminder', href: '/plans/winter-menu' },
    { brand: 'Atelier Vale', plan: 'Spring drop', status: 'draft' as Status, text: 'All 9 posts are ready. No share link yet.', cta: 'Share for review', href: '/plans/spring-drop?share=1' },
  ];

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <div className="stack gap-2" style={{ maxWidth: 720 }}>
            <span className="t-meta">Morpho · Agency plan · {state.brands.length} of 20 brands</span>
            <h1 className="t-display">3 plans are waiting on you</h1>
            <p>Lina asked for changes on {changes} posts, one plan has sat in review for 3 days, and one is ready to send.</p>
          </div>
          <Link href="/plans/october-launch/posts/single-origin" className="btn btn-on-inverse"><Icon icon={Inbox} />Open inbox</Link>
        </div>
      </section>

      <section className={styles.needsBand}>
        <div className={`${styles.inner} ${styles.col}`}>
          <h2 className="t-title">Needs you</h2>
          <div className={styles.needsGrid}>
            {needs.map((n) => (
              <Link key={n.plan} href={n.href} className={styles.needCard}>
                <span className="row between gap-2"><span className="t-meta ink-3">{n.brand}</span><StatusTag status={n.status} /></span>
                <span className="t-strong">{n.plan}</span>
                <span className="ink-2">{n.text}</span>
                <span className="row gap-2 t-strong" style={{ marginTop: 8 }}>{n.cta}<Icon icon={ArrowRight} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.brandsSection}>
        <div className={`${styles.inner} ${styles.col}`} style={{ gap: 24 }}>
          <div className="row wrap between gap-4">
            <div className="stack gap-1">
              <h2 className="t-title">Brands</h2>
              <span className="t-meta ink-3">{state.brands.length} brands · {state.plans.length} plans · {totalPosts} posts</span>
            </div>
            <div className="row wrap gap-2">
              <label htmlFor="brand-search" className="sr-only">Search brands</label>
              <input id="brand-search" type="search" className="input" style={{ width: 240 }} placeholder="Search brands" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="button" className="btn btn-primary"><Icon icon={Plus} />Add brand</button>
            </div>
          </div>

          {brands.length === 0 ? (
            <div className="callout">No brands match “{q}”.</div>
          ) : (
            <div className={styles.brandGrid}>
              {brands.map((b) => {
                const plans = state.plans.filter((p) => p.brandId === b.id);
                return (
                  <article key={b.id} className={styles.brandCard}>
                    <div className="row gap-3">
                      <BrandAvatar brand={b} size={40} />
                      <div className="stack grow">
                        <span className="t-strong">{b.name}</span>
                        <span className="t-meta ink-3">@{b.username}</span>
                      </div>
                      <button type="button" className="btn btn-quiet btn-icon" aria-label={`More actions for ${b.name}`}><Icon icon={Ellipsis} /></button>
                    </div>
                    <div className={styles.swatches} aria-hidden="true">
                      {b.swatches.map((c, i) => <span key={i} style={{ background: c }} />)}
                    </div>
                    <div className="stack">
                      {plans.map((p) => (
                        <Link key={p.id} href={p.posts.length ? `/plans/${p.id}` : `/plans/${p.id}/upload`} className={styles.planRow}>
                          <span className="row between gap-2" style={{ alignItems: 'baseline' }}>
                            <span className="t-strong">{p.name}</span>
                            <span className="t-meta ink-3" style={{ whiteSpace: 'nowrap' }}>{p.posts.length} posts · {p.updated}</span>
                          </span>
                          <StatusBar plan={p} />
                        </Link>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
