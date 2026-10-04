import type { Post, PostType, Status } from './types';

export const STATUS_ORDER: Status[] = ['approved', 'changes', 'review', 'scheduled', 'draft'];

export const STATUS_LABEL: Record<Status, string> = {
  approved: 'Approved',
  changes: 'Changes requested',
  review: 'In review',
  scheduled: 'Scheduled',
  draft: 'Draft',
};

export const TYPE_LABEL: Record<PostType, string> = {
  post: 'Single image',
  carousel: 'Carousel',
  reel: 'Reel',
};

export function typeText(post: Post): string {
  if (post.type === 'carousel') return `Carousel · ${post.slides.length} slides`;
  if (post.type === 'reel') return `Reel${post.reelLength ? ` · ${post.reelLength}` : ''}`;
  return 'Single image';
}

/** Posting order: the bottom-right (oldest) tile is post 1. */
export function postNumber(index: number, total: number): number {
  return total - index;
}

/** A client has acted on a post when it is approved, has changes requested, or is already scheduled. */
export function isReviewed(status: Status): boolean {
  return status === 'approved' || status === 'changes' || status === 'scheduled';
}
