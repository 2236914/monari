'use client';

import { ChevronDown } from 'lucide-react';
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/status';
import type { Status } from '@/lib/types';
import { Icon } from './Icon';
import { StatusTag } from './StatusTag';

/** A native <select> (keyboard and screen readers for free) wearing the status tag as its face. */
export function StatusSelect({ id, value, onChange }: { id: string; value: Status; onChange: (s: Status) => void }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--line)' }}>
      <StatusTag status={value} />
      <Icon icon={ChevronDown} />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Status)}
        style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}
      >
        {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
    </div>
  );
}
