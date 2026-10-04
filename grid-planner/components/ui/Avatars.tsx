import type { Brand, Role } from '@/lib/types';

/** A person. Clients are black, teammates grey; round is reserved for avatars. */
export function PersonAvatar({ name, role, size = 28 }: { name: string; role: Role; size?: number }) {
  const client = role === 'client';
  return (
    <span
      className="avatar"
      title={name}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.45),
        lineHeight: 1,
        background: client ? 'var(--inverse)' : 'var(--block)',
        color: client ? 'var(--on-inverse)' : 'var(--on-block)',
      }}
    >
      {name.trim()[0]?.toUpperCase() ?? '?'}
    </span>
  );
}

/** The client's Instagram profile picture. */
export function BrandAvatar({ brand, size = 32 }: { brand: Brand; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: brand.avatarBg,
        color: brand.avatarFg,
        fontFamily: 'var(--brand-font)',
        fontWeight: 800,
        fontSize: Math.round(size * 0.46),
        letterSpacing: '-0.05em',
      }}
    >
      {brand.initial}
    </span>
  );
}

/** The agency's logo tile on the client link. Uses the brand colour inside `.brand-scope`. */
export function LogoTile({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--brand, var(--inverse))',
        color: 'var(--on-brand, var(--on-inverse))',
        fontWeight: 600,
        fontSize: Math.round(size * 0.45),
      }}
    >
      {name.trim()[0]?.toUpperCase() || 'M'}
    </span>
  );
}
