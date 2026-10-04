import type { Media } from '@/lib/types';
import { PostArt } from './PostArt';

/** Renders one slide at 3:4 (the original). Uploaded files are cropped to fill. */
export function MediaView({ media }: { media: Media }) {
  if (media.kind === 'art') return <PostArt art={media.art} />;
  const box: React.CSSProperties = { width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', background: 'var(--sunk)' };
  if (media.kind === 'video') return <video src={media.url} style={box} muted playsInline preload="metadata" />;
  // eslint-disable-next-line @next/next/no-img-element -- local object URLs, nothing for next/image to optimise
  return <img src={media.url} alt="" style={box} draggable={false} />;
}

/** A tile shows the centre of the 3:4 original, cropped to the grid ratio, like Instagram. */
export function CroppedMedia({ media }: { media: Media }) {
  return (
    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <span style={{ display: 'block', width: '100%', flex: 'none' }}>
        <MediaView media={media} />
      </span>
    </span>
  );
}
