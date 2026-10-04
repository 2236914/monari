'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, ChevronLeft, ChevronRight, Ellipsis, Heart, MapPin, MessageCircle, MessageCirclePlus, Send, TriangleAlert } from 'lucide-react';
import { usePlanByToken, useStore } from '@/lib/store';
import { isReviewed, postNumber, typeText } from '@/lib/status';
import type { Status } from '@/lib/types';
import { MediaView } from '../MediaView';
import { Icon } from '../ui/Icon';
import { BrandAvatar, LogoTile, PersonAvatar } from '../ui/Avatars';
import { StatusTag } from '../ui/StatusTag';
import { CommentPin } from '../ui/CommentPin';
import { FieldMessage } from '../ui/Field';
import { Sheet } from './Sheet';
import styles from './client.module.css';

const igIcon = { strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, size: 24 };

export function ClientPost({ token, postId }: { token: string; postId: string }) {
  const router = useRouter();
  const { state, actions } = useStore();
  const { link, plan, brand } = usePlanByToken(token);
  const trackRef = useRef<HTMLDivElement>(null);

  const [slide, setSlide] = useState(0);
  const [commenting, setCommenting] = useState(false);
  const [pending, setPending] = useState<{ x: number; y: number; slide: number } | null>(null);
  const [sheet, setSheet] = useState<'comment' | 'changes' | null>(null);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [changes, setChanges] = useState('');
  const [changesTried, setChangesTried] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [postId]);

  if (!link || !plan || !brand) return null;
  const index = plan.posts.findIndex((p) => p.id === postId);
  const post = index >= 0 ? plan.posts[index] : null;
  if (!post) {
    return (
      <div className={styles.column} style={{ padding: 24, gap: 12 }}>
        <h1 className="t-title">This post isn&apos;t in the plan any more</h1>
        <Link href={`/s/${token}`}>Back to the grid</Link>
      </div>
    );
  }

  const total = plan.posts.length;
  const number = postNumber(index, total);
  const newer = index > 0 ? plan.posts[index - 1] : null;
  const older = index < total - 1 ? plan.posts[index + 1] : null;
  const approveMode = link.mode === 'approve';
  const canComment = link.allowComments;
  const guest = state.guestName;
  const threads = state.threads.filter((t) => t.postId === post.id && t.visibility === 'client');
  const openThreads = threads.filter((t) => t.status === 'open');
  const pins = openThreads.filter((t) => t.slideIndex === slide && t.x !== null && t.y !== null && t.onVersion === post.version);
  const yourStatus: Status = post.status === 'scheduled' ? 'approved' : post.status === 'approved' || post.status === 'changes' ? post.status : 'review';
  const author = guest ?? name.trim();

  function goNext() {
    const next = plan!.posts.find((p) => p.id !== post!.id && !isReviewed(p.status));
    router.push(next ? `/s/${token}/p/${next.id}` : `/s/${token}/done`);
  }

  function flash(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  }

  function onTrackScroll() {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== slide) setSlide(i);
  }

  function scrollBy(dir: -1 | 1) {
    const el = trackRef.current;
    el?.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  }

  function tapSlide(e: React.MouseEvent<HTMLDivElement>, i: number) {
    if (!commenting) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPending({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, slide: i });
    setSheet('comment');
  }

  function postComment() {
    setTried(true);
    if (!body.trim() || !author) return;
    if (!guest) actions.setGuest(name.trim());
    actions.addThread({
      planId: plan!.id,
      postId: post!.id,
      slideIndex: pending ? pending.slide : null,
      x: pending?.x ?? null,
      y: pending?.y ?? null,
      visibility: 'client',
      status: 'open',
      onVersion: post!.version,
      comments: [{ id: '', author, role: 'client', body: body.trim(), at: 'now' }],
    });
    setBody('');
    setTried(false);
    setPending(null);
    setSheet(null);
    setCommenting(false);
    flash('Comment posted. The team can see it now.');
  }

  function sendChanges() {
    setChangesTried(true);
    if (!changes.trim() || !author) return;
    if (!guest) actions.setGuest(name.trim());
    actions.requestChanges(plan!.id, post!.id, author, changes.trim());
    setChanges('');
    setSheet(null);
    goNext();
  }

  const nameFields = !guest && (
    <>
      <span aria-hidden="true" className="divider" />
      <p className="t-small ink-2">First time here? Tell the team who you are. We&apos;ll only ask once.</p>
      <div className="field">
        <label htmlFor="guest-name" className="label">Your name</label>
        <input id="guest-name" className="input input-touch" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={(tried || changesTried) && !name.trim() ? true : undefined} aria-describedby="guest-name-error" />
        <FieldMessage id="guest-name" error={(tried || changesTried) && !name.trim() ? 'Error: Add your name so the team knows who this is from.' : null} />
      </div>
      <div className="field">
        <label htmlFor="guest-email" className="label">Email (optional)</label>
        <input id="guest-email" type="email" className="input input-touch" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby="guest-email-hint" />
        <span id="guest-email-hint" className="hint">We&apos;ll email you when someone replies.</span>
      </div>
    </>
  );

  return (
    <div className={styles.column}>
      {commenting ? (
        <div className={styles.modeBar}>
          <Icon icon={MapPin} />
          <span className="grow t-strong">Tap where you want to comment</span>
          <button type="button" className={styles.modeCancel} onClick={() => { setCommenting(false); setPending(null); setSheet(null); }}>Cancel</button>
        </div>
      ) : (
        <header className={styles.topbar} style={{ paddingLeft: 4 }}>
          <Link href={`/s/${token}`} className="btn btn-quiet btn-icon btn-touch" aria-label="Back to the grid"><Icon icon={ChevronLeft} size={20} /></Link>
          <LogoTile name={state.branding.name} />
          <div className="stack grow" style={{ marginLeft: 4 }}>
            <span className="t-strong">Post {number} of {total}</span>
            <span className="t-meta ink-3">{typeText(post)}</span>
          </div>
          {newer ? <Link href={`/s/${token}/p/${newer.id}`} className="btn btn-quiet btn-icon btn-touch" aria-label="Newer post"><Icon icon={ChevronLeft} size={20} /></Link> : null}
          {older ? <Link href={`/s/${token}/p/${older.id}`} className="btn btn-quiet btn-icon btn-touch" aria-label="Older post"><Icon icon={ChevronRight} size={20} /></Link> : null}
        </header>
      )}

      <div className={styles.ig}>
        <div className={styles.postHead}>
          <BrandAvatar brand={brand} size={32} />
          <span className="grow" style={{ fontSize: 14, fontWeight: 600 }}>{brand.username}</span>
          <Ellipsis {...igIcon} />
        </div>

        <div className={styles.media}>
          <div ref={trackRef} className={styles.track} onScroll={onTrackScroll} style={commenting ? { overflowX: 'hidden' } : undefined}>
            {post.slides.map((m, i) => (
              <div key={i} className={styles.slide} onClick={(e) => tapSlide(e, i)} style={{ cursor: commenting ? 'crosshair' : 'default' }} aria-label={`Slide ${i + 1} of ${post.slides.length}`}>
                <MediaView media={m} />
                {commenting && i === slide && !pending && <span className={styles.tapHint}>Slide {i + 1} of {post.slides.length}</span>}
                {openThreads
                  .filter((t) => t.slideIndex === i && t.x !== null && t.y !== null && t.onVersion === post.version)
                  .map((t) => (
                    <CommentPin key={t.id} x={t.x!} y={t.y!} initial={t.comments[0].author[0]} tone={t.comments[0].role === 'client' ? 'brand' : 'team'} size={40} />
                  ))}
                {pending && pending.slide === i && <CommentPin x={pending.x} y={pending.y} initial={(author || '?')[0].toUpperCase()} tone="brand" active size={48} />}
              </div>
            ))}
          </div>
          {post.slides.length > 1 && (
            <>
              <span className={styles.pill}>{slide + 1}/{post.slides.length}</span>
              {slide > 0 && <button type="button" className={styles.arrow} style={{ left: 4 }} aria-label="Previous slide" onClick={() => scrollBy(-1)}><span><ChevronLeft size={18} strokeWidth={2.5} aria-hidden /></span></button>}
              {slide < post.slides.length - 1 && <button type="button" className={styles.arrow} style={{ right: 4 }} aria-label="Next slide" onClick={() => scrollBy(1)}><span><ChevronRight size={18} strokeWidth={2.5} aria-hidden /></span></button>}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <Heart {...igIcon} />
          <MessageCircle {...igIcon} />
          <Send {...igIcon} />
          {post.slides.length > 1 && (
            <span className={styles.dots} aria-hidden="true">
              {post.slides.map((_, i) => <span key={i} className={i === slide ? styles.dotOn : undefined} />)}
            </span>
          )}
          <Bookmark {...igIcon} style={{ marginLeft: 'auto' }} />
        </div>

        <p className={styles.caption}><strong>{brand.username}</strong> {post.caption || <span style={{ color: 'var(--ig-ink-2)' }}>No caption yet.</span>}</p>

        {threads.length > 0 && (
          <button type="button" className={styles.commentsLink} aria-expanded={showComments} onClick={() => setShowComments((s) => !s)}>
            {showComments ? 'Hide comments' : `View all ${threads.reduce((n, t) => n + t.comments.length, 0)} comments`}
          </button>
        )}
        {showComments && (
          <ul className={styles.commentsList}>
            {threads.flatMap((t) => t.comments.map((c) => (
              <li key={c.id}>
                <PersonAvatar name={c.author} role={c.role} size={28} />
                <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                  <span className="t-small"><strong>{c.author}</strong> <span className="ink-3">{c.at}</span></span>
                  <span className="t-small">{c.body}</span>
                  <span className="t-meta ink-3">{t.slideIndex === null ? 'Whole post' : `Slide ${t.slideIndex + 1}`}{t.status === 'resolved' ? ' · resolved' : ''}</span>
                </div>
              </li>
            )))}
          </ul>
        )}
        <span role="status" className="sr-only">{pins.length ? `${pins.length} comments on this slide` : ''}</span>
      </div>

      {(approveMode || canComment) && !commenting && (
        <div className={styles.dock}>
          {toast && <span role="status" className="row gap-2 t-small"><Icon icon={Check} />{toast}</span>}
          {approveMode && (
            <div className="row between gap-2">
              <span className="label">Your review</span>
              <StatusTag status={yourStatus} />
            </div>
          )}
          <div className="row gap-2">
            {canComment && (
              <button type="button" className="btn btn-lg grow" style={{ padding: '0 12px' }} onClick={() => { setCommenting(true); setPending(null); }}>
                <Icon icon={MessageCirclePlus} />Comment
              </button>
            )}
            {approveMode && (
              <button type="button" className="btn btn-lg grow" style={{ padding: '0 12px' }} onClick={() => { setSheet('changes'); setChangesTried(false); }}>
                <Icon icon={TriangleAlert} />Request changes
              </button>
            )}
          </div>
          {approveMode && (
            post.status === 'approved' || post.status === 'scheduled' ? (
              <button type="button" className="btn btn-lg btn-block" onClick={goNext}><Icon icon={Check} />Approved · next post</button>
            ) : (
              <button type="button" className="btn btn-brand btn-lg btn-block" onClick={() => { actions.approve(plan.id, post.id); goNext(); }}><Icon icon={Check} />Approve</button>
            )
          )}
        </div>
      )}

      <Sheet open={sheet === 'comment'} modal={false} title={`Comment on slide ${(pending?.slide ?? slide) + 1}`} meta={`Post ${number}`} onClose={() => { setSheet(null); setPending(null); }}>
        <label htmlFor="c-body" className="sr-only">Your comment</label>
        <textarea id="c-body" className="input" rows={3} style={{ minHeight: 72, resize: 'none' }} placeholder="What should change here?" value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={tried && !body.trim() ? true : undefined} aria-describedby="c-body-error" />
        <FieldMessage id="c-body" error={tried && !body.trim() ? 'Error: Write your comment first.' : null} />
        {nameFields}
        <button type="button" className="btn btn-brand btn-lg btn-block" onClick={postComment}><Icon icon={Send} />Post comment</button>
      </Sheet>

      <Sheet open={sheet === 'changes'} title="Request changes" meta={`Post ${number} of ${total} · whole post`} onClose={() => setSheet(null)}>
        <div className="field">
          <label htmlFor="ch-body" className="label">What should change?</label>
          <textarea
            id="ch-body"
            className="input"
            rows={4}
            style={{ resize: 'none' }}
            placeholder="Tell the team what to change on this post."
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
            aria-invalid={changesTried && !changes.trim() ? true : undefined}
            aria-describedby="ch-body-error"
          />
          <FieldMessage id="ch-body" error={changesTried && !changes.trim() ? 'Error: Add a comment so the team knows what to change.' : null} />
        </div>
        <div className="callout">To point at a spot, close this, tap Comment, then tap the slide.</div>
        {guest ? <span className="t-small ink-3">Posting as {guest}.</span> : nameFields}
        <div className="row gap-2">
          <button type="button" className="btn btn-lg grow" onClick={() => setSheet(null)}>Cancel</button>
          <button type="button" className="btn btn-brand btn-lg" style={{ flex: 2 }} onClick={sendChanges}><Icon icon={TriangleAlert} />Send request</button>
        </div>
      </Sheet>
    </div>
  );
}
