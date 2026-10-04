'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, MessageCircle, SquarePlay } from 'lucide-react';
import type { Post, Ratio } from '@/lib/types';
import { STATUS_LABEL, postNumber, typeText } from '@/lib/status';
import { CroppedMedia } from '../MediaView';
import { Icon } from '../ui/Icon';
import { StatusTag } from '../ui/StatusTag';
import styles from './PlannerGrid.module.css';

const RATIO: Record<Ratio, string> = { '3:4': '3 / 4', '4:5': '4 / 5', '1:1': '1 / 1' };

interface GridProps {
  posts: Post[];
  ratio: Ratio;
  showNumbers: boolean;
  selectedId: string | null;
  commentCounts: Record<string, number>;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

interface TileProps {
  post: Post;
  number: number;
  ratio: Ratio;
  showNumbers: boolean;
  selected: boolean;
  comments: number;
  overlay?: boolean;
}

function TileFace({ post, number, showNumbers, selected, comments }: Omit<TileProps, 'ratio'>) {
  return (
    <>
      <CroppedMedia media={post.slides[post.coverIndex] ?? post.slides[0]} />
      {showNumbers && <span className={styles.num}>{number}</span>}
      <span className={styles.badges}>
        {comments > 0 && <span className={styles.badge}><Icon icon={MessageCircle} size={12} />{comments}</span>}
        {post.type === 'carousel' && <span className={`${styles.badge} ${styles.square}`}><Icon icon={Copy} size={12} /></span>}
        {post.type === 'reel' && <span className={`${styles.badge} ${styles.square}`}><Icon icon={SquarePlay} size={12} /></span>}
      </span>
      <span className={styles.status}><StatusTag status={post.status} /></span>
      {selected && <span className={styles.selected} aria-hidden="true"><span /></span>}
    </>
  );
}

function SortableTile(props: TileProps & { onSelect: () => void }) {
  const { post, ratio, onSelect } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  const label = `Post ${props.number}, ${typeText(post)}, ${STATUS_LABEL[post.status]}${props.comments ? `, ${props.comments} comments` : ''}`;
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={styles.tile}
      style={{ aspectRatio: RATIO[ratio], transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      {...listeners}
      aria-roledescription="sortable post"
      aria-label={label}
      aria-pressed={props.selected}
      onClick={onSelect}
    >
      <TileFace {...props} />
    </button>
  );
}

export function PlannerGrid({ posts, ratio, showNumbers, selectedId, commentCounts, onSelect, onReorder }: GridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Hold about 0.3s on touch, so a quick swipe still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  );

  const total = posts.length;
  const idx = (id: string | number) => posts.findIndex((p) => p.id === id);
  const num = (id: string | number) => postNumber(idx(id), total);

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up post ${num(active.id)}. Use the arrow keys to move it, Space to drop, Escape to cancel.`,
    onDragOver: ({ active, over }) => (over ? `Post ${num(active.id)} is over position ${idx(over.id) + 1} of ${total}.` : undefined),
    onDragEnd: ({ active, over }) => (over ? `Dropped post ${num(active.id)} at position ${idx(over.id) + 1}.` : 'Dropped.'),
    onDragCancel: ({ active }) => `Cancelled. Post ${num(active.id)} is back where it was.`,
  };

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(idx(active.id), idx(over.id));
  }

  const active = activeId ? posts.find((p) => p.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: 'Press Enter to open this post. Press Space to pick it up, the arrow keys to move it, and Space again to drop it.' },
      }}
    >
      <SortableContext items={posts.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className={styles.grid}>
          {posts.map((p, i) => (
            <SortableTile
              key={p.id}
              post={p}
              number={postNumber(i, total)}
              ratio={ratio}
              showNumbers={showNumbers}
              selected={p.id === selectedId}
              comments={commentCounts[p.id] ?? 0}
              onSelect={() => onSelect(p.id)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {active ? (
          <div className={`${styles.tile} ${styles.overlay}`} style={{ aspectRatio: RATIO[ratio] }}>
            <TileFace post={active} number={num(active.id)} showNumbers={showNumbers} selected={false} comments={commentCounts[active.id] ?? 0} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
