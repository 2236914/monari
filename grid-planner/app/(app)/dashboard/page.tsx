'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Clock } from 'lucide-react';
import { DASHBOARD } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { postNumber, typeText } from '@/lib/status';
import type { Status } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { StatusTag } from '@/components/ui/StatusTag';
import { PersonAvatar } from '@/components/ui/Avatars';
import { MediaView } from '@/components/MediaView';
import { PostArt } from '@/components/PostArt';
import styles from './dashboard.module.css';

type Range = keyof typeof DASHBOARD.ranges;

export default function DashboardPage() {
  const { state } = useStore();
  const [range, setRange] = useState<Range>('30d');
  const [hi, setHi] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const d = DASHBOARD.ranges[range];
  const n = d.values.length;
  const sel = hi ?? n - 1;
  const max = Math.max(1, ...d.values);

  // Live counts from the plans in the store, so approving on the client link updates these.
  const counts = useMemo(() => {
    const all = state.plans.flatMap((p) => p.posts);
    const oct = state.plans.find((p) => p.id === 'october-launch');
    return {
      changes: all.filter((p) => p.status === 'changes').length,
      review: all.filter((p) => p.status === 'review').length,
      reviewPlans: state.plans.filter((p) => p.posts.some((x) => x.status === 'review')).length,
      queue: (oct?.posts ?? [])
        .map((p, i) => ({ p, i, total: oct!.posts.length }))
        .filter(({ p }) => p.status === 'changes' || p.status === 'review'),
    };
  }, [state.plans]);

  const queue = [
    ...counts.queue.map(({ p, i, total }) => ({
      key: p.id,
      media: p.slides[p.coverIndex],
      post: `Post ${postNumber(i, total)}`,
      type: typeText(p),
      plan: 'October launch',
      brand: 'Halden Coffee',
      status: p.status as Status,
      from: p.status === 'changes' ? 'Lina' : 'Waiting on Lina',
      href: `/plans/october-launch/posts/${p.id}`,
      cta: p.status === 'changes' ? 'Open feedback' : 'Open post',
    })),
    { key: 'winter', media: { kind: 'art' as const, art: 2 }, post: 'Posts 1–4', type: '4 posts', plan: 'Winter menu', brand: 'Nori Ramen', status: 'review' as Status, from: 'Kenji · 3d', href: '/plans/winter-menu', cta: 'Send reminder' },
    { key: 'spring', media: { kind: 'art' as const, art: 9 }, post: 'All posts', type: '9 posts', plan: 'Spring drop', brand: 'Atelier Vale', status: 'draft' as Status, from: 'Your team', href: '/plans/spring-drop', cta: 'Share for review' },
  ];

  return (
    <main className={`container ${styles.page}`}>
      <div className="row wrap between gap-4" style={{ alignItems: 'flex-end' }}>
        <div className="stack gap-2">
          <h1 className="t-display">Dashboard</h1>
          <span className="t-meta ink-3">Morpho · {state.brands.length} brands · {d.text}</span>
        </div>
        <div className="seg" role="group" aria-label="Date range">
          {(['7d', '30d', '90d'] as Range[]).map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => { setRange(r); setHi(null); }}>
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tiles}>
        <Link href="/plans/october-launch/posts/single-origin" className={`${styles.tile} ${styles.tileStrong}`}>
          <span className="row between gap-2"><span>Changes requested</span><span className="t-meta">Right now</span></span>
          <span className="t-display">{counts.changes} {counts.changes === 1 ? 'post' : 'posts'}</span>
          <span className="row gap-2 t-small">Open feedback<Icon icon={ArrowRight} /></span>
        </Link>
        <div className={styles.tile}>
          <span className="row between gap-2"><span className="ink-2">Waiting on clients</span><span className="t-meta ink-3">Right now</span></span>
          <span className="t-display">{counts.review} posts</span>
          <span className="t-small ink-3">In review across {counts.reviewPlans} plans</span>
        </div>
        <div className={styles.tile}>
          <span className="ink-2">Approved</span>
          <span className="t-display">{d.approved} posts</span>
          <span className="t-small ink-3">{d.delta}</span>
        </div>
        <div className={styles.tile}>
          <span className="ink-2">Time to approval</span>
          <span className="t-display">{d.tta}</span>
          <span className="t-small ink-3">Median, from link sent to approved</span>
        </div>
      </div>

      <div className={styles.split}>
        <section aria-labelledby="chart-title" className={`card ${styles.panel} ${styles.wide}`}>
          <div className="row wrap between gap-2" style={{ alignItems: 'flex-start' }}>
            <div className="stack">
              <h2 id="chart-title" className="t-title">Posts approved per {d.unit}</h2>
              <span role="status" className="t-meta ink-3">{d.full[sel]} · {d.values[sel]} approved</span>
            </div>
            <button type="button" className="btn btn-sm" aria-pressed={table} onClick={() => setTable((t) => !t)}>{table ? 'Show chart' : 'Show table'}</button>
          </div>
          {!table ? (
            <div className="stack gap-2">
              <div className={styles.chart}>
                <span className={`t-meta ${styles.max}`} aria-hidden="true">{max}</span>
                <div className={styles.bars} onMouseLeave={() => setHi(null)}>
                  {d.values.map((v, i) => (
                    <button
                      key={d.full[i]}
                      type="button"
                      className={styles.barHit}
                      aria-label={`${d.full[i]}: ${v} posts approved`}
                      onMouseEnter={() => setHi(i)}
                      onFocus={() => setHi(i)}
                    >
                      <span className={styles.bar} style={{ height: `${(v / max) * 100}%`, background: i === sel ? 'var(--inverse)' : 'var(--block)' }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.ticks} aria-hidden="true">
                {d.labels.map((l, i) => <span key={d.full[i]}>{n > 8 && i % 2 === 1 ? '' : l}</span>)}
              </div>
            </div>
          ) : (
            <div className="scroll-x card">
              <table className="table">
                <thead><tr><th scope="col">{d.unitTitle}</th><th scope="col" style={{ textAlign: 'right' }}>Posts approved</th></tr></thead>
                <tbody>
                  {d.values.map((v, i) => (
                    <tr key={d.full[i]}><td className="t-meta">{d.full[i]}</td><td className="t-meta" style={{ textAlign: 'right' }}>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="links-title" className={`card ${styles.panel} ${styles.narrow}`}>
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <h2 id="links-title" className="t-title">Share links</h2>
            <span className="t-meta ink-3">5 active</span>
          </div>
          <div className={styles.metric}>
            <span className="t-display">4 of 5</span>
            <span className="t-small ink-2">links got at least one client action</span>
          </div>
          <ul className={styles.list}>
            {DASHBOARD.links.map((l) => (
              <li key={l.plan}>
                <div className="stack grow">
                  <span className={`t-strong ${styles.ellipsis}`}>{l.plan}</span>
                  <span className="t-meta ink-3">{l.meta}</span>
                </div>
                {l.acted ? (
                  <span className="row gap-1 t-meta"><Icon icon={Check} size={12} />Client acted</span>
                ) : (
                  <span className="row gap-1 t-meta ink-3"><Icon icon={Clock} size={12} />No action yet</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="queue-title" className="card">
        <div className="row wrap between gap-2" style={{ padding: 16, alignItems: 'baseline' }}>
          <h2 id="queue-title" className="t-title">Needs action</h2>
          <span className="t-meta ink-3">{queue.length} items</span>
        </div>
        <div className="scroll-x">
          <table className="table" style={{ minWidth: 760 }}>
            <thead>
              <tr><th scope="col">Post</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">From</th><th scope="col"><span className="sr-only">Action</span></th></tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.key}>
                  <td>
                    <span className="row gap-3">
                      <span className={styles.thumb}><MediaView media={q.media} /></span>
                      <span className="stack"><span className="t-strong">{q.post}</span><span className="t-meta ink-3">{q.type}</span></span>
                    </span>
                  </td>
                  <td><span className="stack"><span>{q.plan}</span><span className="t-meta ink-3">{q.brand}</span></span></td>
                  <td><StatusTag status={q.status} /></td>
                  <td>{q.from}</td>
                  <td style={{ textAlign: 'right' }}><Link href={q.href} className="btn btn-sm">{q.cta}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.split}>
        <section aria-labelledby="week-title" className={`card ${styles.panel} ${styles.wide}`}>
          <div className="row wrap between gap-2" style={{ alignItems: 'baseline' }}>
            <h2 id="week-title" className="t-title">Going out this week</h2>
            <span className="t-meta ink-3">Sun 4 – Sat 10 Oct · 7 approved or scheduled</span>
          </div>
          <div className="scroll-x">
            <div className={styles.week}>
              {DASHBOARD.week.map((day) => (
                <div key={day.date} className={styles.day} style={{ background: day.posts.length ? 'var(--surface)' : 'var(--sunk)' }}>
                  <span className="stack"><span className="t-strong">{day.name}</span><span className="t-meta ink-3">{day.date}</span></span>
                  {day.posts.map((p) => (
                    <span key={p.label} className="stack gap-1">
                      <span style={{ border: '1px solid var(--line)' }}><PostArt art={p.art} /></span>
                      <span className={`t-meta ink-2 ${styles.ellipsis}`} style={{ fontSize: 11 }}>{p.label}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="activity-title" className={`card ${styles.panel} ${styles.narrow}`}>
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <h2 id="activity-title" className="t-title">Activity</h2>
            <span className="row gap-2 t-meta ink-3"><span aria-hidden="true" style={{ width: 8, height: 8, background: 'var(--inverse)' }} />Live</span>
          </div>
          <ul className={styles.activity}>
            {DASHBOARD.activity.map((a) => (
              <li key={a.what}>
                <Link href={a.href}>
                  <PersonAvatar name={a.who} role={a.role as 'client' | 'team'} />
                  <span className="stack grow">
                    <span><span className="t-strong">{a.who}</span> {a.what}</span>
                    <span className="t-meta ink-3">{a.meta}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
