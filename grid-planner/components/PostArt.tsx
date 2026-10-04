import type { CSSProperties, ReactNode } from 'react';
import styles from './PostArt.module.css';

/**
 * Sample post artwork for the fictional "Halden Coffee" brand. Flat colour compositions
 * sized in container units so they scale from a 36px thumbnail to a full slide.
 * Stand-in for real uploads: posts are the only colour on screen.
 */

const C = {
  tomato: '#E2492F',
  butter: '#F3D36B',
  forest: '#1E4D3A',
  sky: '#A8C8E8',
  plum: '#5B2A4E',
  sand: '#E9DCC4',
  navy: '#1B2A4A',
  orange: '#F08A3C',
  mint: '#BFE3CF',
};

function Box({ style, children }: { style: CSSProperties; children?: ReactNode }) {
  return <div className={styles.abs} style={style}>{children}</div>;
}

function Mono({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return <div className={`${styles.abs} ${styles.mono}`} style={style}>{children}</div>;
}

function Lines({ style, lines }: { style: CSSProperties; lines: string[] }) {
  return (
    <div className={styles.abs} style={style}>
      {lines.map((l) => <div key={l}>{l}</div>)}
    </div>
  );
}

function Circle({ style }: { style: CSSProperties }) {
  return <div className={styles.abs} style={{ borderRadius: '50%', ...style }} />;
}

const ARTS: Record<number, () => ReactNode> = {
  1: () => (
    <Box style={{ inset: 0, background: C.tomato, color: C.butter }}>
      <Mono style={{ top: '7cqw', left: '7cqw' }}>HALDEN COFFEE</Mono>
      <Lines style={{ left: '6cqw', bottom: '6cqw', fontSize: '23cqw', lineHeight: 0.88, letterSpacing: '-0.045em' }} lines={['New', 'season.']} />
    </Box>
  ),
  2: () => (
    <Box style={{ inset: 0, background: C.butter, color: C.forest }}>
      <Circle style={{ left: '15cqw', top: '16cqw', width: '70cqw', height: '70cqw', background: C.forest }} />
      <Circle style={{ left: '27cqw', top: '28cqw', width: '46cqw', height: '46cqw', background: C.sand }} />
      <Box style={{ left: '7cqw', bottom: '7cqw', fontSize: '8cqw', lineHeight: 1, letterSpacing: '-0.02em' }}>Oat flat white</Box>
    </Box>
  ),
  3: () => (
    <Box style={{ inset: 0, background: C.forest, color: C.sand }}>
      <Lines style={{ top: '8cqw', left: '6cqw', fontSize: '19cqw', lineHeight: 0.9, letterSpacing: '-0.045em' }} lines={['Single', 'origin.']} />
      <Circle style={{ right: '7cqw', top: '62cqw', width: '24cqw', height: '24cqw', background: C.butter }} />
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>HUILA, COLOMBIA</Mono>
      <Mono style={{ right: '7cqw', bottom: '7cqw', letterSpacing: 0 }}>01 / 06</Mono>
    </Box>
  ),
  4: () => (
    <Box style={{ inset: 0, background: C.sky, color: C.navy }}>
      <Box style={{ left: '5cqw', top: '36cqw', fontSize: '32cqw', lineHeight: 1, letterSpacing: '-0.06em' }}>12.10</Box>
      <Box style={{ left: '7cqw', top: '74cqw', fontSize: '9cqw', lineHeight: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>Opening day</Box>
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>DOORS AT 7AM</Mono>
    </Box>
  ),
  5: () => (
    <Box style={{ inset: 0, background: C.plum, color: C.butter }}>
      <Lines style={{ top: '9cqw', left: '7cqw', fontSize: '12cqw', lineHeight: 0.95, letterSpacing: '-0.03em' }} lines={['Golden hour', 'blend']} />
      <Box style={{ left: '10cqw', bottom: 0, width: '80cqw', height: '54cqw', borderRadius: '40cqw 40cqw 0 0', background: C.orange }} />
    </Box>
  ),
  6: () => (
    <Box style={{ inset: 0, background: C.sand, color: C.forest }}>
      <Lines style={{ top: '8cqw', left: '7cqw', fontSize: '13cqw', lineHeight: 0.95, letterSpacing: '-0.035em' }} lines={['Slow', 'mornings,', 'done right.']} />
      <Box style={{ right: '7cqw', bottom: '7cqw', width: '20cqw', height: '20cqw', background: C.tomato }} />
    </Box>
  ),
  7: () => (
    <Box style={{ inset: 0, background: C.orange, color: C.navy }}>
      <Lines style={{ top: '9cqw', left: '6cqw', fontSize: '18cqw', lineHeight: 0.9, letterSpacing: '-0.045em' }} lines={['Behind', 'the bar']} />
      <Box style={{ right: '9cqw', bottom: '18cqw', width: '30cqw', height: '38cqw', borderRadius: '0 0 8cqw 8cqw', background: C.navy }} />
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>REEL · 0:24</Mono>
    </Box>
  ),
  8: () => (
    <Box style={{ inset: 0, background: C.mint, color: C.forest }}>
      <div className={styles.abs} style={{ left: '14cqw', top: '12cqw', width: '72cqw', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6cqw' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: i === 4 ? C.tomato : C.forest }} />
        ))}
      </div>
      <Lines style={{ left: '7cqw', bottom: '7cqw', fontSize: '10cqw', lineHeight: 0.92, letterSpacing: '-0.03em' }} lines={['Roasted', 'in-house.']} />
    </Box>
  ),
  9: () => (
    <Box style={{ inset: 0, background: C.navy, color: C.butter }}>
      <Box style={{ left: 0, right: 0, top: '48cqw', textAlign: 'center', fontSize: '23cqw', lineHeight: 1, letterSpacing: '-0.06em' }}>halden</Box>
      <Mono style={{ left: 0, right: 0, top: '78cqw', textAlign: 'center' }}>COFFEE &amp; BAKERY</Mono>
    </Box>
  ),
  10: () => (
    <Box style={{ inset: 0, background: C.tomato, color: C.sand }}>
      <Box style={{ left: 0, right: 0, top: 0, height: '76cqw', background: C.sand }} />
      <Lines style={{ top: '9cqw', left: '6cqw', fontSize: '15cqw', lineHeight: 0.92, letterSpacing: '-0.04em', color: C.tomato }} lines={['Croissant', 'Fridays']} />
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>EVERY FRIDAY · FROM 7AM</Mono>
    </Box>
  ),
  11: () => (
    <Box style={{ inset: 0, background: C.butter, color: C.plum }}>
      <Lines style={{ top: '9cqw', left: '6cqw', fontSize: '21cqw', lineHeight: 0.88, letterSpacing: '-0.05em' }} lines={["We're", 'hiring.']} />
      <Circle style={{ right: '8cqw', top: '66cqw', width: '28cqw', height: '28cqw', background: C.plum }} />
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>BARISTAS · LINK IN BIO</Mono>
    </Box>
  ),
  12: () => (
    <Box style={{ inset: 0, background: C.sky, color: C.plum }}>
      <Circle style={{ right: '-16cqw', top: '-16cqw', width: '70cqw', height: '70cqw', background: C.forest }} />
      <Lines style={{ left: '7cqw', bottom: '7cqw', fontSize: '14cqw', lineHeight: 0.92, letterSpacing: '-0.04em' }} lines={['Fall menu', 'is here.']} />
    </Box>
  ),
  13: () => (
    <Box style={{ inset: 0, background: C.forest, color: C.sand }}>
      <Mono style={{ top: '8cqw', left: '7cqw', color: C.butter }}>TASTING NOTES</Mono>
      <Lines style={{ top: '20cqw', left: '6cqw', fontSize: '12cqw', lineHeight: 1.05, letterSpacing: '-0.03em' }} lines={['Red apple', 'Panela', 'Cocoa nib']} />
      <Box style={{ left: '7cqw', right: '7cqw', top: '76cqw', height: '0.8cqw', background: C.sand }} />
      <Lines style={{ left: '7cqw', top: '82cqw', fontSize: '6cqw', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.01em' }} lines={['Bright, juicy,', 'a long sweet finish.']} />
      <Mono style={{ right: '7cqw', bottom: '7cqw', letterSpacing: 0 }}>02 / 06</Mono>
    </Box>
  ),
  14: () => (
    <Box style={{ inset: 0, background: C.sand, color: C.forest }}>
      <Mono style={{ top: '8cqw', left: '7cqw' }}>PROCESS</Mono>
      <Lines style={{ top: '20cqw', left: '6cqw', fontSize: '12cqw', lineHeight: 1.05, letterSpacing: '-0.03em' }} lines={['Washed,', 'sun-dried,', 'hand-picked.']} />
      <Circle style={{ left: '7cqw', bottom: '7cqw', width: '30cqw', height: '30cqw', background: C.forest }} />
      <Mono style={{ right: '7cqw', bottom: '7cqw', letterSpacing: 0 }}>03 / 06</Mono>
    </Box>
  ),
  15: () => (
    <Box style={{ inset: 0, background: C.butter, color: C.forest }}>
      <Mono style={{ top: '8cqw', left: '7cqw' }}>BREW GUIDE · V60</Mono>
      <Lines style={{ top: '22cqw', left: '6cqw', fontSize: '17cqw', lineHeight: 1, letterSpacing: '-0.05em' }} lines={['15 g', '250 ml', '3:30']} />
      <Mono style={{ right: '7cqw', bottom: '7cqw', letterSpacing: 0 }}>04 / 06</Mono>
    </Box>
  ),
  16: () => (
    <Box style={{ inset: 0, background: C.tomato, color: C.butter }}>
      <Lines style={{ left: '6cqw', bottom: '16cqw', fontSize: '17cqw', lineHeight: 0.9, letterSpacing: '-0.045em' }} lines={['On the bar', 'all month.']} />
      <Mono style={{ left: '7cqw', bottom: '7cqw' }}>HALDEN COFFEE</Mono>
      <Mono style={{ right: '7cqw', bottom: '7cqw', letterSpacing: 0 }}>05 / 06</Mono>
    </Box>
  ),
};

export function PostArt({ art }: { art: number }) {
  const render = ARTS[art] ?? ARTS[1];
  return (
    <div className={styles.art} aria-hidden="true">
      {render()}
    </div>
  );
}
