import { Calendar, Check, Clock, Pencil, TriangleAlert, type LucideIcon } from 'lucide-react';
import { STATUS_LABEL } from '@/lib/status';
import type { Status } from '@/lib/types';
import { Icon } from './Icon';
import styles from './StatusTag.module.css';

const ICON: Record<Status, LucideIcon> = {
  approved: Check,
  changes: TriangleAlert,
  review: Clock,
  scheduled: Calendar,
  draft: Pencil,
};

/** Status is fill weight + icon + word, always all three. Never colour. */
export function StatusTag({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={`${styles.tag} ${styles[status]} ${className ?? ''}`}>
      <Icon icon={ICON[status]} size={12} />
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}

export const STATUS_ICON = ICON;
