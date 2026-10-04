import Link from 'next/link';
import type { ReactNode } from 'react';
import { PostArt } from '../PostArt';
import { ThemeSwitch } from '../AppHeader';
import styles from './AuthShell.module.css';

interface AuthShellProps {
  headline: string;
  body: string;
  /** Replaces the default 3×3 post grid in the black panel. */
  aside?: ReactNode;
  showGrid?: boolean;
  children: ReactNode;
}

const GRID = [1, 11, 12, 7, 3, 5, 10, 2, 4];

export function AuthShell({ headline, body, aside, showGrid = false, children }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <section className={styles.brand}>
        <Link href="/sign-in" className={styles.logo}>Grid Planner</Link>
        {aside ?? (showGrid && (
          <div className={styles.art} aria-hidden="true">
            {GRID.map((a) => <PostArt key={a} art={a} />)}
          </div>
        ))}
        <div className={styles.copy}>
          <h2 className={styles.headline}>{headline}</h2>
          <p>{body}</p>
        </div>
      </section>
      <main className={styles.main}>
        <div className={styles.theme}><ThemeSwitch /></div>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}

export function AuthHeading({ eyebrow, title, children }: { eyebrow?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="stack gap-1">
      {eyebrow && <span className="t-meta ink-3">{eyebrow}</span>}
      <h1 className="t-display">{title}</h1>
      {children && <p className="ink-2">{children}</p>}
    </div>
  );
}

export function IconSquare({ children, tone = 'inverse' }: { children: ReactNode; tone?: 'inverse' | 'outline' }) {
  return <span className={tone === 'inverse' ? styles.iconInverse : styles.iconOutline}>{children}</span>;
}
