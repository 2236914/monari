'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, AtSign, Check, ChevronLeft, ChevronRight, Ellipsis, Lock, MapPin, MessageCirclePlus, Send, SmilePlus, Upload } from 'lucide-react';
import { usePlan, useStore } from '@/lib/store';
import { CURRENT_USER } from '@/lib/mock-data';
import { postNumber, typeText } from '@/lib/status';
import type { Media, Thread } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { StatusTag } from '@/components/ui/StatusTag';
import { PersonAvatar } from '@/components/ui/Avatars';
import { CommentPin } from '@/components/ui/CommentPin';
import { MediaView } from '@/components/MediaView';
import { ThemeSwitch } from '@/components/AppHeader';
import styles from './viewer.module.css';

type Pending = { x: number; y: number } | null;

export function PostViewer({ planId, postId, initialSlide, initialThread }: { planId: string; postId: string; initialSlide?: number; initialThread?: string }) {
  const { state, actions } = useStore();
  const { plan } = usePlan(planId);
  const index = plan?.posts.findIndex((p) => p.id === postId) ?? -1;
  const post = index >= 0 ? plan!.posts[index] : null;

  const startThread = state.threads.find((t) => t.id === initialThread);
  const [slide, setSlide] = useState(startThread?.slideIndex ?? initialSlide ?? post?.coverIndex ?? 0);
  const [commentMode, setCommentMode] = useState(true);
  const [pending, setPending] = useState<Pending>(null);
  const [draft, setDraft] = useState('');
  const [visibility, setVisibility] = useState<Thread['visibility']>('client');
  const [tab, setTab] = useState<'open' | 'resolved'>('open');
  const [who, setWho] = useState<'all' | 'client' | 'internal'>('all');
  const [activeId, setActiveId] = useState<string | null>(initialThread ?? null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const threads = useMemo(() => state.threads.filter((t) => t.postId === postId), [state.threads, postId]);
  const listed = threads.filter((t) => t.status === tab && (who === 'all' || (who === 'internal' ? t.visibility === 'internal' : t.visibility === 'client')));
  const pins = threads.filter((t) => t.status === 'open' && t.slideIndex === slide && t.x !== null && t.y !== null && t.onVersion === post?.version);
  const openCount = threads.filter((t) => t.status === 'open').length;
  const resolvedCount = threads.length - openCount;

  // Press C to toggle comment mode, Esc to drop a half-made pin.
  const onKey = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable]')) {
      if (e.key === 'Escape') setPending(null);
      return;
    }
    if (e.key === 'c' || e.key === 'C') setCommentMode((m) => !m);
    if (e.key === 'Escape') { setPending(null); setCommentMode(false); }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  useEffect(() => {
    if (pending) draftRef.current?.focus();
  }, [pending]);

  if (!plan || !post) {
    return <main className="container" style={{ padding: 48 }}><h1 className="t-display">Post not found</h1><Link href={`/plans/${planId}`}>Back to the grid</Link></main>;
  }

  const total = plan.posts.length;
  const number = postNumber(index, total);
  const newer = index > 0 ? plan.posts[index - 1] : null;
  const older = index < total - 1 ? plan.posts[index + 1] : null;
  const current = Math.min(slide, post.slides.length - 1);

  function dropPin(e: React.MouseEvent<HTMLDivElement>) {
    if (!commentMode || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setPending({ x, y });
    setActiveId(null);
  }

  function postComment() {
    if (!pending || !draft.trim() || !post) return;
    const t = actions.addThread({
      planId, postId, slideIndex: current, x: pending.x, y: pending.y, visibility, status: 'open', onVersion: post.version,
      comments: [{ id: '', author: CURRENT_USER.name, role: 'team', body: draft.trim(), at: 'now' }],
    });
    setPending(null);
    setDraft('');
    setActiveId(t.id);
    setTab('open');
  }

  function replaceSlide(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const media: Media = { kind: f.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(f), name: f.name };
    actions.replaceSlide(planId, postId, current, media);
    setPending(null);
  }

  const popLeft = pending && pending.x > 0.55;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="row wrap gap-4" style={{ minWidth: 0 }}>
          <Link href={`/plans/${planId}`} className="btn btn-quiet"><Icon icon={ArrowLeft} />Back to grid</Link>
          <span aria-hidden="true" className={styles.vr} />
          <div className="row gap-1">
            {newer ? <Link href={`/plans/${planId}/posts/${newer.id}`} className="btn btn-sm btn-icon" aria-label="Newer post"><Icon icon={ChevronLeft} /></Link> : <span className="btn btn-sm btn-icon" aria-disabled="true"><Icon icon={ChevronLeft} /></span>}
            {older ? <Link href={`/plans/${planId}/posts/${older.id}`} className="btn btn-sm btn-icon" aria-label="Older post"><Icon icon={ChevronRight} /></Link> : <span className="btn btn-sm btn-icon" aria-disabled="true"><Icon icon={ChevronRight} /></span>}
          </div>
          <div className="stack">
            <h1 className="t-strong">Post {number} of {total}</h1>
            <span className="t-meta ink-3">{typeText(post)} · v{post.version}</span>
          </div>
          <StatusTag status={post.status} />
        </div>
        <div className="row wrap gap-2">
          <ThemeSwitch />
          <button type="button" className={`btn ${commentMode ? 'btn-primary' : ''}`} aria-pressed={commentMode} onClick={() => setCommentMode((m) => !m)}>
            <Icon icon={MessageCirclePlus} />Comment<kbd className={styles.kbd}>C</kbd>
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}><Icon icon={Upload} />Replace slide</button>
          <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={(e) => { replaceSlide(e.target.files); e.target.value = ''; }} />
        </div>
      </header>

      <div className={styles.body}>
        <main className={styles.stageCol}>
          {commentMode && (
            <div className={styles.modeHint}><Icon icon={MapPin} />Comment mode. Click a spot on the slide to drop a pin. Press Esc to leave.</div>
          )}
          <div className={styles.stageRow}>
            <button type="button" className="btn btn-icon" aria-label="Previous slide" disabled={current === 0} onClick={() => { setSlide(current - 1); setPending(null); }}><Icon icon={ChevronLeft} /></button>
            {/* The stage is a pointer target for placing pins; keyboard users comment on the whole post from the panel. */}
            <div ref={stageRef} className={styles.stage} style={{ cursor: commentMode ? 'crosshair' : 'default' }} onClick={dropPin}>
              <MediaView media={post.slides[current]} />
              {pins.map((t) => {
                const first = t.comments[0];
                return (
                  <CommentPin
                    key={t.id}
                    x={t.x!}
                    y={t.y!}
                    initial={first.author[0]}
                    tone={first.role === 'client' ? 'client' : 'team'}
                    internal={t.visibility === 'internal'}
                    active={activeId === t.id}
                    label={`Thread ${t.number}, ${first.author}`}
                    onClick={() => { setActiveId(t.id); setPending(null); document.getElementById(`thread-${t.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }}
                  />
                );
              })}
              {pending && (
                <>
                  <CommentPin x={pending.x} y={pending.y} initial={CURRENT_USER.name[0]} tone="team" active />
                  <div
                    className={styles.composer}
                    style={{ top: `${pending.y * 100}%`, ...(popLeft ? { right: `calc(${(1 - pending.x) * 100}% + 12px)` } : { left: `calc(${pending.x * 100}% + 60px)` }) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="row between gap-2">
                      <span className="t-strong">New comment</span>
                      <span className="t-meta ink-3">Slide {current + 1}</span>
                    </div>
                    <div className="seg seg-block" role="group" aria-label="Who can see this">
                      <button type="button" aria-pressed={visibility === 'client'} onClick={() => setVisibility('client')}>Client and team</button>
                      <button type="button" aria-pressed={visibility === 'internal'} onClick={() => setVisibility('internal')}>Team only</button>
                    </div>
                    <label htmlFor="new-comment" className="sr-only">Comment</label>
                    <textarea
                      ref={draftRef}
                      id="new-comment"
                      className="input"
                      rows={3}
                      style={{ minHeight: 76, resize: 'none' }}
                      placeholder="Add a comment. Type @ to mention a teammate."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment(); }}
                    />
                    <div className="row between gap-2">
                      <div className="row gap-1">
                        <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label="Mention a teammate" onClick={() => setDraft((d) => `${d}@`)}><Icon icon={AtSign} /></button>
                        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setPending(null)}>Cancel</button>
                      </div>
                      <button type="button" className="btn btn-primary btn-sm" disabled={!draft.trim()} onClick={postComment}>Post</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button type="button" className="btn btn-icon" aria-label="Next slide" disabled={current === post.slides.length - 1} onClick={() => { setSlide(current + 1); setPending(null); }}><Icon icon={ChevronRight} /></button>
          </div>

          <div className="stack gap-2" style={{ alignItems: 'center' }}>
            <div className={styles.thumbs}>
              {post.slides.map((s, i) => {
                const n = threads.filter((t) => t.status === 'open' && t.slideIndex === i).length;
                return (
                  <button key={i} type="button" className={styles.thumb} aria-current={i === current ? 'true' : undefined} aria-label={`Slide ${i + 1}${n ? `, ${n} comments` : ''}`} onClick={() => { setSlide(i); setPending(null); }}>
                    <MediaView media={s} />
                    {n > 0 && <span className={styles.thumbCount}>{n}</span>}
                  </button>
                );
              })}
            </div>
            <span className="t-meta ink-3">Slide {current + 1} of {post.slides.length} · 1080 × 1440</span>
          </div>
        </main>

        <aside aria-label="Comments" className={styles.panel}>
          <div className={styles.panelHead}>
            <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
              <h2 className="t-title">Comments</h2>
              <span className="t-meta ink-3">{openCount} open · {resolvedCount} resolved</span>
            </div>
            <div className="row wrap gap-2">
              <div className="seg" role="group" aria-label="Thread status">
                <button type="button" aria-pressed={tab === 'open'} onClick={() => setTab('open')}>Open {openCount}</button>
                <button type="button" aria-pressed={tab === 'resolved'} onClick={() => setTab('resolved')}>Resolved {resolvedCount}</button>
              </div>
              <div className="seg" role="group" aria-label="Who">
                <button type="button" aria-pressed={who === 'all'} onClick={() => setWho('all')}>All</button>
                <button type="button" aria-pressed={who === 'client'} onClick={() => setWho('client')}>Client</button>
                <button type="button" aria-pressed={who === 'internal'} onClick={() => setWho('internal')}>Internal</button>
              </div>
            </div>
          </div>

          {listed.length === 0 && (
            <div className={styles.emptyList}>
              {tab === 'open' ? 'No open comments here. Turn on comment mode and click the slide to start a thread.' : 'Nothing resolved yet.'}
            </div>
          )}

          {listed.map((t) => {
            const [first, ...rest] = t.comments;
            const previous = t.onVersion < post.version;
            const isActive = activeId === t.id;
            return (
              <article key={t.id} id={`thread-${t.id}`} className={`${styles.thread} ${isActive ? styles.threadActive : ''}`}>
                <button
                  type="button"
                  className={styles.threadHead}
                  onClick={() => { setActiveId(t.id); if (t.slideIndex !== null) setSlide(t.slideIndex); setPending(null); }}
                  aria-label={`Show thread ${t.number} on the slide`}
                >
                  <span className={t.visibility === 'internal' ? styles.avatarRing : undefined}><PersonAvatar name={first.author} role={first.role} /></span>
                  <span className="t-strong">{first.author}</span>
                  {t.visibility === 'internal' ? (
                    <span className="role-tag role-tag-block"><Icon icon={Lock} size={12} />Internal</span>
                  ) : (
                    <span className="role-tag">{first.role === 'client' ? 'Client' : 'Team'}</span>
                  )}
                  <span className="t-meta ink-3" style={{ marginLeft: 'auto' }}>#{t.number} · {first.at}</span>
                </button>

                {previous && t.slideIndex !== null ? (
                  <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: 48, flex: 'none', border: '1px dashed var(--line)', opacity: 0.85 }}><MediaView media={post.slides[t.slideIndex] ?? post.slides[0]} /></div>
                    <div className="stack gap-2" style={{ minWidth: 0 }}>
                      <span className="role-tag role-tag-sunk" style={{ alignSelf: 'flex-start' }}>On previous version</span>
                      <p>{first.body}</p>
                      <span className="t-meta ink-3">Slide {t.slideIndex + 1} · pinned on v{t.onVersion}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{renderMentions(first.body)}</p>
                    <span className="t-meta ink-3">
                      {t.slideIndex === null ? 'Whole post' : `Slide ${t.slideIndex + 1}`} · v{t.onVersion}
                      {t.visibility === 'internal' ? ' · Only your team can see this thread' : ''}
                    </span>
                  </>
                )}

                {rest.map((c) => (
                  <div key={c.id} className={styles.reply}>
                    <PersonAvatar name={c.author} role={c.role} size={24} />
                    <div className="stack gap-1" style={{ minWidth: 0 }}>
                      <span className="row gap-2"><span className="t-strong">{c.author}</span><span className="t-meta ink-3">{c.at}</span></span>
                      <p>{renderMentions(c.body)}</p>
                    </div>
                  </div>
                ))}

                {t.status === 'open' && (
                  <form
                    className={styles.replyForm}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const body = (replies[t.id] ?? '').trim();
                      if (!body) return;
                      actions.reply(t.id, CURRENT_USER.name, 'team', body);
                      setReplies((r) => ({ ...r, [t.id]: '' }));
                    }}
                  >
                    <label htmlFor={`reply-${t.id}`} className="sr-only">Reply to {first.author}</label>
                    <input id={`reply-${t.id}`} className="input" placeholder={`Reply to ${first.author}`} value={replies[t.id] ?? ''} onChange={(e) => setReplies((r) => ({ ...r, [t.id]: e.target.value }))} />
                    <button type="submit" className="btn btn-primary btn-icon" aria-label="Send reply"><Icon icon={Send} /></button>
                  </form>
                )}

                <div className="row wrap gap-1" style={{ paddingLeft: 36 }}>
                  {previous && t.status === 'open' && (
                    <button type="button" className="btn btn-sm" onClick={() => actions.keepOnVersion(t.id, post.version)}>Keep on new version</button>
                  )}
                  {t.status === 'open' ? (
                    <button type="button" className="btn btn-sm" onClick={() => actions.setThreadStatus(t.id, 'resolved')}><Icon icon={Check} />Resolve</button>
                  ) : (
                    <button type="button" className="btn btn-sm" onClick={() => actions.setThreadStatus(t.id, 'open')}>Reopen</button>
                  )}
                  <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label="Add reaction"><Icon icon={SmilePlus} /></button>
                  <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label="More actions"><Icon icon={Ellipsis} /></button>
                </div>
              </article>
            );
          })}

          <div className={styles.panelFoot}>Press C, then click the slide to add a pin. Internal threads never appear on the client link.</div>
        </aside>
      </div>
    </div>
  );
}

function renderMentions(text: string) {
  return text.split(/(@\w+)/g).map((part, i) => (part.startsWith('@') ? <strong key={i}>{part}</strong> : part));
}
