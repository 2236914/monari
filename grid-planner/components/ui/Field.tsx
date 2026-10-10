'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { Icon } from './Icon';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  labelAside?: ReactNode;
  touch?: boolean;
}

/** Label, input, then a hint or an error. Errors are words that start with "Error:", never colour. */
export function TextField({ id, label, hint, error, labelAside, touch = true, className, ...rest }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <div className="row between gap-2">
        <label htmlFor={id} className="label">{label}</label>
        {labelAside}
      </div>
      <input
        id={id}
        className={`input ${touch ? 'input-touch' : ''} ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function FieldMessage({ id, hint, error }: { id: string; hint?: ReactNode; error?: string | null }) {
  if (error) {
    return (
      <span id={`${id}-error`} className="error-text">
        <Icon icon={TriangleAlert} size={16} style={{ marginTop: 1 }} />
        <span>{error}</span>
      </span>
    );
  }
  if (hint) return <span id={`${id}-hint`} className="hint">{hint}</span>;
  return null;
}

export function PasswordField(props: Omit<FieldProps, 'type'>) {
  const [show, setShow] = useState(false);
  const { id, label, hint, error, labelAside, ...rest } = props;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <div className="row between gap-2">
        <label htmlFor={id} className="label">{label}</label>
        {labelAside}
      </div>
      <div style={{ display: 'flex', position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="input input-touch"
          style={{ paddingRight: 48 }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        <button
          type="button"
          className="btn btn-quiet btn-icon"
          style={{ position: 'absolute', right: 2, top: 2, height: 40, width: 44 }}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          <Icon icon={show ? EyeOff : Eye} size={16} />
        </button>
      </div>
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function emailError(value: string, empty = 'Error: Enter your email address.'): string | null {
  const v = value.trim();
  if (!v) return empty;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Error: That doesn't look like an email address.";
  return null;
}
