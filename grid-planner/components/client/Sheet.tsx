'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Icon } from '../ui/Icon';
import styles from './client.module.css';

interface SheetProps {
  open: boolean;
  title: string;
  meta?: string;
  onClose: () => void;
  /** Leave the page above visible (comment mode keeps the pin in view). */
  modal?: boolean;
  children: ReactNode;
}

/** A bottom sheet built on <dialog>, so Esc, focus and screen readers behave. */
export function Sheet({ open, title, meta, onClose, modal = true, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) (modal ? d.showModal() : d.show());
    if (!open && d.open) d.close();
  }, [open, modal]);

  return (
    <dialog ref={ref} className={`${styles.sheet} ${modal ? '' : styles.sheetInline}`} aria-labelledby="sheet-title" onClose={onClose} onCancel={onClose}>
      <span aria-hidden="true" className={styles.handle} />
      <div className="row between gap-2" style={{ alignItems: 'flex-start' }}>
        <div className="stack">
          <h2 id="sheet-title" className="t-title">{title}</h2>
          {meta && <span className="t-meta ink-3">{meta}</span>}
        </div>
        <button type="button" className="btn btn-quiet btn-icon btn-touch" style={{ margin: '-6px -10px 0 0' }} aria-label="Close" onClick={onClose}>
          <Icon icon={X} size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
