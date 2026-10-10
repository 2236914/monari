import type { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: 12 | 16 | 20 | 24 | number;
  className?: string;
  /** Only for icons that stand alone without a visible word. */
  label?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** Lucide in Monari's line style: 1.5 stroke (2 at 12px), square caps, miter joins, currentColor. */
export function Icon({ icon: Glyph, size = 16, className, label, strokeWidth, style }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth ?? (size <= 12 ? 2 : 1.5)}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      style={{ flex: 'none', ...style }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
