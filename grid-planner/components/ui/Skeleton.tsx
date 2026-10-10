import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

/**
 * A flat placeholder block in `surface-sunk`. Monari has no shimmer or gradient: blocks
 * pulse gently in opacity, and stay still for people who prefer reduced motion.
 * Decorative: wrap a group of skeletons in an element with aria-busy and a visually
 * hidden "Loading…" label instead of labelling each block.
 */
export function Skeleton({ width = '100%', height = 16, style, className }: { width?: number | string; height?: number | string; style?: CSSProperties; className?: string }) {
  return <span aria-hidden="true" className={`${styles.block} ${className ?? ''}`} style={{ width, height, ...style }} />;
}

/** Lines of text; the last line is shorter so it reads as a paragraph. */
export function SkeletonText({ lines = 3, lineHeight = 14, gap = 8 }: { lines?: number; lineHeight?: number; gap?: number }) {
  return (
    <span aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 && lines > 1 ? '60%' : '100%'} />
      ))}
    </span>
  );
}

/** A 3:4 tile, like an empty grid post. */
export function SkeletonTile({ style }: { style?: CSSProperties }) {
  return <Skeleton height="auto" style={{ aspectRatio: '3 / 4', ...style }} />;
}
