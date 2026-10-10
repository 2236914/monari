'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Monitor, Moon, Search, Sun } from 'lucide-react';
import { useTheme, type ThemeChoice } from '@/lib/theme';
import { CURRENT_USER } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { Icon } from './ui/Icon';
import { PersonAvatar } from './ui/Avatars';
import styles from './AppHeader.module.css';

export type Section = 'dashboard' | 'brands' | 'inbox' | 'settings';

const NAV: { id: Section; label: string; href: string }[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'brands', label: 'Brands', href: '/brands' },
  { id: 'inbox', label: 'Inbox', href: '/plans/october-launch/posts/single-origin' },
  { id: 'settings', label: 'Settings', href: '/settings/branding' },
];

export function ThemeSwitch() {
  const { choice, setChoice } = useTheme();
  const opts: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light theme', icon: Sun },
    { id: 'system', label: 'Match system theme', icon: Monitor },
    { id: 'dark', label: 'Dark theme', icon: Moon },
  ];
  return (
    <div className="seg" role="group" aria-label="Theme">
      {opts.map((o) => (
        <button key={o.id} type="button" aria-pressed={choice === o.id} aria-label={o.label} title={o.label} onClick={() => setChoice(o.id)} className={styles.themeBtn}>
          <Icon icon={o.icon} size={16} />
        </button>
      ))}
    </div>
  );
}

function sectionFor(path: string): Section | undefined {
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/brands') || path.startsWith('/plans')) return 'brands';
  if (path.startsWith('/settings')) return 'settings';
  return undefined;
}

export function AppHeader({ section }: { section?: Section }) {
  const path = usePathname();
  section = section ?? sectionFor(path);
  const { state } = useStore();
  const open = state.threads.filter((t) => t.status === 'open').length;
  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.logo}>Grid Planner</Link>
      <nav aria-label="Main" className={styles.nav}>
        {NAV.map((n) => (
          <Link key={n.id} href={n.href} aria-current={section === n.id ? 'page' : undefined} className={styles.navLink}>
            {n.label}
            {n.id === 'inbox' && <span className={`t-meta ${styles.count}`}>{open}</span>}
          </Link>
        ))}
      </nav>
      <div className={styles.tools}>
        <ThemeSwitch />
        <button type="button" className="btn btn-quiet btn-icon" aria-label="Search">
          <Icon icon={Search} size={20} />
        </button>
        <button type="button" className={`btn btn-quiet btn-icon ${styles.bell}`} aria-label={`Notifications, ${3} unread`}>
          <Icon icon={Bell} size={20} />
          <span aria-hidden="true" className={styles.badge}>3</span>
        </button>
        <PersonAvatar name={CURRENT_USER.name} role="team" size={32} />
      </div>
    </header>
  );
}
