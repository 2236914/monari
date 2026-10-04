import { ChevronDown, Ellipsis, Grid3x3, SquarePlay, SquareUser, UserPlus } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { BrandAvatar } from './ui/Avatars';
import styles from './InstagramProfile.module.css';

/**
 * The one place that looks like Instagram rather than Monari: system font, round avatar,
 * rounded grey buttons. Purely a preview, so nothing in here is interactive.
 */

const igIcon = { strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export function IgProfileHeader({ brand, postCount, variant }: { brand: Brand; postCount: number; variant: 'desktop' | 'mobile' }) {
  const counts = [
    { n: String(postCount), l: 'posts' },
    { n: brand.followers, l: 'followers' },
    { n: brand.following, l: 'following' },
  ];
  const bio = (
    <div className={styles.bio}>
      <div className={styles.strong}>{brand.displayName}</div>
      <div className={styles.muted}>{brand.category}</div>
      <div>{brand.bio}</div>
      <div className={`${styles.strong} ${styles.link}`}>{brand.link}</div>
    </div>
  );

  if (variant === 'desktop') {
    return (
      <div className={styles.ig}>
        <div className={styles.deskTop}>
          <BrandAvatar brand={brand} size={96} />
          <div className={styles.deskInfo}>
            <div className={styles.deskName}>
              <span className={styles.username}>{brand.username}</span>
              <span className={styles.btnRow}>
                <span className={styles.igBtn}>Following</span>
                <span className={styles.igBtn}>Message</span>
              </span>
            </div>
            <div className={styles.deskCounts}>
              {counts.map((c) => <span key={c.l}><span className={styles.strong}>{c.n}</span> {c.l}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.deskBio}>{bio}</div>
        <div className={styles.deskTabs}>
          <span className={styles.tabOn}><Grid3x3 size={12} {...igIcon} />Posts</span>
          <span><SquarePlay size={12} {...igIcon} />Reels</span>
          <span><SquareUser size={12} {...igIcon} />Tagged</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ig}>
      <div className={styles.mobTop}>
        <span className={styles.mobUser}>{brand.username}</span>
        <Ellipsis size={24} {...igIcon} />
      </div>
      <div className={styles.mobHead}>
        <BrandAvatar brand={brand} size={86} />
        <div className={styles.mobCounts}>
          {counts.map((c) => (
            <div key={c.l}><div className={styles.mobNum}>{c.n}</div><div className={styles.mobLabel}>{c.l}</div></div>
          ))}
        </div>
      </div>
      <div className={styles.mobBio}>{bio}</div>
      <div className={styles.mobBtns}>
        <span className={styles.igBtn} style={{ flex: 1 }}>Following<ChevronDown size={14} strokeWidth={2.5} aria-hidden /></span>
        <span className={styles.igBtn} style={{ flex: 1 }}>Message</span>
        <span className={styles.igBtn} style={{ width: 34, padding: 0 }}><UserPlus size={16} strokeWidth={2} aria-hidden /></span>
      </div>
      <div className={styles.mobTabs}>
        <span className={styles.mobTabOn}><Grid3x3 size={24} {...igIcon} /></span>
        <span><SquarePlay size={24} {...igIcon} /></span>
        <span><SquareUser size={24} {...igIcon} /></span>
      </div>
    </div>
  );
}

/** White Instagram glyph over a post (carousel/reel). */
export function IgOverlayIcon({ type }: { type: 'carousel' | 'reel' }) {
  return (
    <span className={styles.overlayIcon} aria-hidden="true">
      {type === 'carousel' ? (
        <svg viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
      ) : (
        <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" /></svg>
      )}
    </span>
  );
}

export { styles as igStyles };
