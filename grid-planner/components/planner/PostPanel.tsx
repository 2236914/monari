'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Copy, Download, Maximize2, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { postNumber, typeText } from '@/lib/status';
import type { Media, Plan, Post, Thread } from '@/lib/types';
import { MediaView } from '../MediaView';
import { Icon } from '../ui/Icon';
import { PersonAvatar } from '../ui/Avatars';
import { StatusTag } from '../ui/StatusTag';
import { StatusSelect } from '../ui/StatusSelect';
import styles from './PostPanel.module.css';

interface PostPanelProps {
  plan: Plan;
  post: Post;
  index: number;
  threads: Thread[];
  onClose: () => void;
}

export function PostPanel({ plan, post, index, threads, onClose }: PostPanelProps) {
  const { actions } = useStore();
  const [slide, setSlide] = useState(post.coverIndex);
  const [caption, setCaption] = useState(post.caption);
  const [note, setNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = plan.posts.length;
  const number = postNumber(index, total);
  const open = threads.filter((t) => t.status === 'open');
  const current = Math.min(slide, post.slides.length - 1);
  const multi = post.slides.length > 1;

  function flash(text: string) {
    setNote(text);
    window.setTimeout(() => setNote(null), 2400);
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const media: Media[] = Array.from(files)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((f) => ({ kind: f.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(f), name: f.name }) as Media);
    actions.addSlides(plan.id, post.id, media);
    flash(`${media.length} ${media.length === 1 ? 'slide' : 'slides'} added. Version ${post.version + 1}.`);
  }

  function download() {
    const files = post.slides.filter((s): s is Extract<Media, { url: string }> => s.kind !== 'art');
    if (!files.length) {
      flash('Sample artwork has no file to download.');
      return;
    }
    files.forEach((f) => {
      const a = document.createElement('a');
      a.href = f.url;
      a.download = f.name;
      a.click();
    });
    flash(`Downloading ${files.length} ${files.length === 1 ? 'file' : 'files'}.`);
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      flash('Caption copied.');
    } catch {
      flash('Could not copy. Select the caption and copy it by hand.');
    }
  }

  return (
    <aside aria-label={`Post ${number} details`} className={styles.panel}>
      <div className={styles.head}>
        <div className="stack gap-1" style={{ minWidth: 0 }}>
          <span className="t-meta ink-3">{typeText(post)} · v{post.version}</span>
          <h2 className="t-title">Post {number} of {total}</h2>
        </div>
        <button type="button" className="btn btn-quiet btn-icon" aria-label="Close post panel" onClick={onClose}><Icon icon={X} size={20} /></button>
      </div>

      <div className={styles.body}>
        <div className="row wrap between gap-2">
          <StatusTag status={post.status} />
          <span className="t-meta ink-3">Edited {plan.updated} by Sean</span>
        </div>

        <div className={styles.preview}>
          <MediaView media={post.slides[current]} />
          <span className={styles.counter}>{current + 1} / {post.slides.length}</span>
          {multi && (
            <>
              <button type="button" className={`btn btn-icon ${styles.navL}`} aria-label="Previous slide" disabled={current === 0} onClick={() => setSlide(current - 1)}><Icon icon={ChevronLeft} /></button>
              <button type="button" className={`btn btn-icon ${styles.navR}`} aria-label="Next slide" disabled={current === post.slides.length - 1} onClick={() => setSlide(current + 1)}><Icon icon={ChevronRight} /></button>
            </>
          )}
          <Link href={`/plans/${plan.id}/posts/${post.id}?slide=${current}`} className={`btn btn-sm ${styles.open}`}><Icon icon={Maximize2} />Open viewer</Link>
        </div>

        <div className="stack gap-2">
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <span className="label">Slides</span>
            <span className="t-meta ink-3">{post.slides.length} · 1080 × 1440</span>
          </div>
          <div className={styles.strip}>
            {post.slides.map((s, i) => (
              <button
                key={i}
                type="button"
                className={styles.thumb}
                aria-label={`Slide ${i + 1}${i === post.coverIndex ? ', cover' : ''}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => setSlide(i)}
              >
                <MediaView media={s} />
                {i === post.coverIndex && <span className={styles.coverTag}>Cover</span>}
              </button>
            ))}
            <button type="button" className={styles.add} aria-label="Add slides" onClick={() => fileRef.current?.click()}><Icon icon={Plus} /></button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </div>
          <div className="row wrap between gap-2">
            <span className="hint">Choose a slide to preview it.</span>
            {current !== post.coverIndex && (
              <button type="button" className="btn btn-sm" onClick={() => { actions.setCover(plan.id, post.id, current); flash(`Slide ${current + 1} is now the cover.`); }}>Make slide {current + 1} the cover</button>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="caption" className="label">Caption</label>
          <textarea
            id="caption"
            className="input"
            rows={6}
            value={caption}
            maxLength={2200}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => actions.commitCaption(plan.id, post.id, caption)}
            aria-describedby="caption-hint"
            style={{ minHeight: 148 }}
          />
          <div className="row between gap-3">
            <span id="caption-hint" className="hint">Hashtags and mentions count toward the limit.</span>
            <span className="t-meta ink-3" style={{ whiteSpace: 'nowrap' }}>{caption.length} / 2,200</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="status" className="label">Status</label>
          <StatusSelect id="status" value={post.status} onChange={(s) => actions.setStatus(plan.id, post.id, s)} />
          <span className="hint">Editing an approved post sends it back to In review.</span>
        </div>

        <div className="stack gap-2">
          <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
            <span className="label">Feedback</span>
            <span className="t-meta ink-3">{open.length} open</span>
          </div>
          {open.length === 0 ? (
            <div className="callout">No comments yet. Feedback from the share link shows up here.</div>
          ) : (
            open.slice(0, 3).map((t) => {
              const first = t.comments[0];
              return (
                <Link key={t.id} href={`/plans/${plan.id}/posts/${post.id}?thread=${t.id}`} className={styles.thread}>
                  <PersonAvatar name={first.author} role={first.role} />
                  <span className="stack gap-1" style={{ minWidth: 0 }}>
                    <span className="row wrap gap-2">
                      <span className="t-strong">{first.author}</span>
                      <span className="role-tag">{t.visibility === 'internal' ? 'Internal' : first.role === 'client' ? 'Client' : 'Team'}</span>
                    </span>
                    <span>{first.body}</span>
                    <span className="t-meta ink-3">#{t.number} · {t.slideIndex === null ? 'Whole post' : `Slide ${t.slideIndex + 1}`} · {first.at}</span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.foot}>
        <span role="status" className={`t-small ${styles.note}`}>{note}</span>
        <div className="row wrap gap-2">
          <button type="button" className="btn btn-sm" disabled={index === 0} onClick={() => actions.move(plan.id, post.id, -1)}><Icon icon={ArrowUp} />Move newer</button>
          <button type="button" className="btn btn-sm" disabled={index === total - 1} onClick={() => actions.move(plan.id, post.id, 1)}><Icon icon={ArrowDown} />Move older</button>
          <button type="button" className="btn btn-sm" onClick={download}><Icon icon={Download} />Download files</button>
          <button type="button" className="btn btn-sm" onClick={copyCaption}><Icon icon={Copy} />Copy caption</button>
          {confirmDelete ? (
            <span className="row gap-2">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => { actions.deletePost(plan.id, post.id); onClose(); }}><Icon icon={Trash2} />Delete post {number}</button>
              <button type="button" className="btn btn-sm btn-quiet" onClick={() => setConfirmDelete(false)}>Keep it</button>
            </span>
          ) : (
            <button type="button" className="btn btn-sm btn-quiet" onClick={() => setConfirmDelete(true)}><Icon icon={Trash2} />Delete post</button>
          )}
        </div>
      </div>
    </aside>
  );
}
