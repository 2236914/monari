'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Icon } from './Icon';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Mono metadata line under the title. */
  meta?: string;
  /** Pinned footer, usually Cancel + one primary action. */
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
}

/**
 * Monari modal on native <dialog>: square, flat, 1px line, solid scrim. Esc and the close
 * button call onClose; focus is trapped by the browser and returns to the opener on close.
 * On phones it becomes a bottom sheet.
 */
export function Dialog({ open, onClose, title, meta, footer, width = 560, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      style={{ ['--dialog-w' as string]: `${width}px` }}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <div className={styles.head}>
        <div className="stack gap-1" style={{ minWidth: 0 }}>
          <h2 id={titleId} className="t-title">{title}</h2>
          {meta && <span className="t-meta ink-3">{meta}</span>}
        </div>
        <button type="button" className="btn btn-quiet btn-icon" aria-label="Close" onClick={onClose}>
          <Icon icon={X} size={20} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.foot}>{footer}</div>}
    </dialog>
  );
}
