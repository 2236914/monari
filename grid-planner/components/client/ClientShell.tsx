'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { brandVars } from '@/lib/brand';
import { usePlanByToken, useStore } from '@/lib/store';
import { Icon } from '../ui/Icon';
import styles from './client.module.css';

/** Applies the agency's saved branding and guards the link (exists, not revoked). */
export function ClientShell({ token, children }: { token: string; children: ReactNode }) {
  const { state } = useStore();
  const { link, plan } = usePlanByToken(token);

  return (
    <div className={`brand-scope ${styles.shell}`} style={brandVars(state.branding)}>
      {link && plan ? (
        children
      ) : (
        <main className={styles.unavailable}>
          <span className={styles.warnSquare}><Icon icon={TriangleAlert} size={20} /></span>
          <h1 className="t-display">This link isn&apos;t available</h1>
          <p className="ink-2">It may have expired or been switched off. Ask whoever sent it for a new one.</p>
          <Link href="/s/k7Qm2xV9pLr4" className="t-small ink-3">Prototype: open the sample link</Link>
        </main>
      )}
    </div>
  );
}
