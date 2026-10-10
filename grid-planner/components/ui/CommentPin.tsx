import styles from './CommentPin.module.css';

interface PinProps {
  x: number;
  y: number;
  initial: string;
  tone: 'client' | 'team' | 'brand';
  internal?: boolean;
  active?: boolean;
  size?: number;
  label?: string;
  onClick?: () => void;
}

/**
 * Figma-style pin: a round bubble with one sharp corner that points at the spot.
 * x/y are 0–1 fractions of the original image.
 */
export function CommentPin({ x, y, initial, tone, internal, active, size = 48, label, onClick }: PinProps) {
  const className = [styles.pin, internal && styles.internal, active && styles.active].filter(Boolean).join(' ');
  const style = { left: `${x * 100}%`, top: `${y * 100}%`, width: size, height: size, borderRadius: `${size / 2}px ${size / 2}px ${size / 2}px 0` };
  const face = (
    <span className={`${styles.face} ${styles[tone]}`} style={{ fontSize: Math.round(size * 0.36) }}>
      {initial}
    </span>
  );
  if (onClick) {
    return (
      <button type="button" className={className} style={style} aria-label={label} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        {face}
      </button>
    );
  }
  return <span className={className} style={style} aria-hidden="true">{face}</span>;
}
