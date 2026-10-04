'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Link2, Plus, TriangleAlert, Upload, X } from 'lucide-react';
import { newId, usePlan, useStore } from '@/lib/store';
import type { Media, Post } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { CroppedMedia } from '@/components/MediaView';
import { BrandAvatar } from '@/components/ui/Avatars';
import styles from './upload.module.css';

const MAX_BYTES = 20 * 1024 * 1024;

type Item = {
  id: string;
  file: File;
  url: string;
  kind: 'image' | 'video';
  progress: number;
  state: 'queued' | 'uploading' | 'added' | 'error';
  error?: string;
};

function sizeText(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function Uploader({ planId }: { planId: string }) {
  const { plan, brand } = usePlan(planId);
  const { actions } = useStore();
  const [mode, setMode] = useState<'each' | 'carousel'>('each');
  const [items, setItems] = useState<Item[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), []);

  if (!plan || !brand) {
    return <main className="container" style={{ padding: 48 }}><h1 className="t-display">Plan not found</h1></main>;
  }

  function accept(list: FileList | null) {
    if (!list?.length || !plan) return;
    // Sorted by name, so post-1, post-2… land in posting order.
    const files = Array.from(list).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const next: Item[] = files.map((f) => {
      const kind = f.type.startsWith('video') ? 'video' : 'image';
      const supported = f.type.startsWith('image') || f.type.startsWith('video');
      const tooBig = f.size > MAX_BYTES;
      return {
        id: newId('u'),
        file: f,
        url: supported && !tooBig ? URL.createObjectURL(f) : '',
        kind,
        progress: 0,
        state: !supported || tooBig ? 'error' : 'queued',
        error: !supported
          ? 'Error: Only images and videos can be posts.'
          : tooBig
            ? 'Error: This file is over 20 MB. Export a smaller version and drop it in again.'
            : undefined,
      };
    });
    setItems((prev) => [...prev, ...next]);
    simulate(next.filter((i) => i.state === 'queued'), mode);
  }

  /** Stand-in for presigned uploads: animates progress, then adds the posts locally. */
  function simulate(queue: Item[], uploadMode: 'each' | 'carousel') {
    if (!queue.length || !plan) return;
    let i = 0;
    const finished: Item[] = [];
    const step = () => {
      const item = queue[i];
      if (!item) return;
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, state: 'uploading' } : p)));
      let pct = 0;
      const t = window.setInterval(() => {
        pct = Math.min(100, pct + 12 + Math.random() * 18);
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, progress: Math.round(pct) } : p)));
        if (pct >= 100) {
          window.clearInterval(t);
          finished.push(item);
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, state: 'added', progress: 100 } : p)));
          if (uploadMode === 'each') {
            const media: Media = { kind: item.kind, url: item.url, name: item.file.name };
            const post: Post = {
              id: newId('post'),
              type: item.kind === 'video' ? 'reel' : 'post',
              slides: [media],
              coverIndex: 0,
              caption: '',
              status: 'draft',
              version: 1,
            };
            actions.addPosts(planId, [post]);
          } else if (finished.length === queue.length) {
            actions.addPosts(planId, [{
              id: newId('post'),
              type: finished.length > 1 ? 'carousel' : finished[0].kind === 'video' ? 'reel' : 'post',
              slides: finished.map((f) => ({ kind: f.kind, url: f.url, name: f.file.name }) as Media),
              coverIndex: 0,
              caption: '',
              status: 'draft',
              version: 1,
            }]);
          }
          i += 1;
          step();
        }
      }, 140);
      timers.current.push(t);
    };
    step();
  }

  const uploading = items.filter((i) => i.state === 'uploading' || i.state === 'queued');
  const added = items.filter((i) => i.state === 'added').length;
  const valid = items.filter((i) => i.state !== 'error').length;
  const previewSlots = Math.max(9, plan.posts.length + uploading.length);

  return (
    <>
      <section className={styles.header}>
        <div className="stack gap-2">
          <nav aria-label="Breadcrumb" className="row gap-1 t-small ink-2">
            <Link href="/brands">Morpho</Link><Icon icon={ChevronRight} />
            <Link href="/brands">{brand.name}</Link><Icon icon={ChevronRight} />
            <Link href={`/plans/${plan.id}`}>{plan.name}</Link>
          </nav>
          <h1 className="t-display">Upload posts</h1>
          <span className="t-meta ink-3">@{brand.username} · {plan.name} · {plan.posts.length ? `${plan.posts.length} posts` : 'No posts yet'}</span>
        </div>
        <div className="row wrap gap-2">
          {plan.posts.length > 0 && <Link href={`/plans/${plan.id}`} className="btn">Go to the grid<Icon icon={ArrowRight} /></Link>}
          {plan.posts.length > 0 ? (
            <Link href={`/plans/${plan.id}?share=1`} className="btn btn-primary"><Icon icon={Link2} />Share for review</Link>
          ) : (
            <button type="button" className="btn" disabled aria-describedby="share-hint"><Icon icon={Link2} />Share for review</button>
          )}
          <span id="share-hint" className="sr-only">Add at least one post to share.</span>
        </div>
      </section>

      <div className={styles.body}>
        <main className={styles.main}>
          <div
            className={`${styles.drop} ${over ? styles.dropOver : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); accept(e.dataTransfer.files); }}
          >
            <span className={styles.dropIcon}><Icon icon={Upload} size={20} /></span>
            <div className="stack gap-1">
              <h2 className="t-title">{over ? 'Drop to upload' : 'Drop images and videos here'}</h2>
              <span className="t-small ink-3">JPG, PNG, MP4 or MOV. Up to 20 MB each.</span>
            </div>
            <div className="seg" role="group" aria-label="How files become posts">
              <button type="button" aria-pressed={mode === 'each'} onClick={() => setMode('each')}>One post each</button>
              <button type="button" aria-pressed={mode === 'carousel'} onClick={() => setMode('carousel')}>One carousel</button>
            </div>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => inputRef.current?.click()}><Icon icon={Plus} />Choose files</button>
            <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { accept(e.target.files); e.target.value = ''; }} />
            <span className="t-small ink-3" style={{ maxWidth: 440 }}>
              {mode === 'each'
                ? 'Files are sorted by name, so post-1, post-2… land in posting order. A single video becomes a reel with an automatic cover.'
                : 'All files become slides of one carousel, in name order. The first file is the cover. You can change it later.'}
            </span>
          </div>

          {items.length > 0 && (
            <div className="stack gap-2">
              <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
                <h2 className="t-strong">{uploading.length ? `Uploading ${valid} files` : 'Uploads'}</h2>
                <span className="t-meta ink-3">{added} of {valid} added</span>
              </div>
              <ul className={styles.list}>
                {items.map((it) => (
                  <li key={it.id} className={it.state === 'error' ? styles.itemError : undefined}>
                    <span className={styles.thumb}>
                      {it.state === 'error' ? <Icon icon={TriangleAlert} /> : it.kind === 'image' && it.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.url} alt="" />
                      ) : null}
                    </span>
                    <div className="stack grow" style={{ gap: 4 }}>
                      <div className="row between gap-2">
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.file.name}</span>
                        {it.state === 'uploading' && <span className="t-meta ink-2">{it.progress}%</span>}
                      </div>
                      {it.state === 'uploading' || it.state === 'queued' ? (
                        <progress className="progress" value={it.progress} max={100} aria-label={`Uploading ${it.file.name}`}>{it.progress}%</progress>
                      ) : (
                        <span className="t-meta ink-3">{sizeText(it.file.size)}{it.kind === 'video' ? ' · video' : ''}</span>
                      )}
                      {it.error && <span className="t-small">{it.error}</span>}
                    </div>
                    {it.state === 'added' && <span className="row gap-1 t-meta"><Icon icon={Check} />Added</span>}
                    {it.state === 'error' && <button type="button" className="btn btn-sm" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}>Remove</button>}
                    {it.state === 'queued' && <button type="button" className="btn btn-quiet btn-icon" aria-label={`Cancel ${it.file.name}`} onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}><Icon icon={X} /></button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <aside aria-label="Grid preview" className={styles.aside}>
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <span className="label">Grid preview</span>
            <span className="t-meta ink-3">{plan.ratio} · newest first</span>
          </div>
          <div className={styles.ig}>
            <div className="row gap-4" style={{ padding: 16 }}>
              <BrandAvatar brand={brand} size={56} />
              <div className="stack" style={{ fontSize: 14, lineHeight: '18px' }}>
                <span className="t-strong">{brand.username}</span>
                <span style={{ color: 'var(--ig-ink-2)' }}>{plan.posts.length} posts · {brand.followers} followers</span>
              </div>
            </div>
            <div className={styles.grid}>
              {uploading.slice().reverse().map((u) => (
                <span key={u.id} className={styles.loading}>{u.progress}%</span>
              ))}
              {plan.posts.map((p) => (
                <span key={p.id} className={styles.tile}><CroppedMedia media={p.slides[p.coverIndex] ?? p.slides[0]} /></span>
              ))}
              {Array.from({ length: Math.max(0, previewSlots - plan.posts.length - uploading.length) }, (_, i) => (
                <span key={`empty-${i}`} className={styles.emptyTile} />
              ))}
            </div>
          </div>
          <span className="t-small ink-3">Posts appear here as they finish uploading. Drag to reorder once they&apos;re in.</span>
        </aside>
      </div>
    </>
  );
}
