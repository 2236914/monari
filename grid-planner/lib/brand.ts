import type { CSSProperties } from 'react';
import type { BrandMode, Branding } from './types';

export const NEUTRAL_HEX = '#141414';
export const DEFAULT_BRANDING: Branding = { hex: NEUTRAL_HEX, mode: 'highlight', name: 'Morpho' };

type RGB = [number, number, number];

const WHITE: RGB = [255, 255, 255];
const INK: RGB = [20, 20, 20];
const PAGE_LIGHT: RGB = [245, 245, 245];
const SURFACE_DARK: RGB = [31, 31, 31];
const NEAR_WHITE: RGB = [245, 245, 245];

export function isHex(value: string): boolean {
  return /^#?[0-9a-f]{6}$/i.test(value.trim());
}

export function normalizeHex(value: string): string {
  return '#' + value.trim().replace('#', '').toUpperCase();
}

function parse(hex: string): RGB {
  const s = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
}

function toHex(c: RGB): string {
  return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function channel(x: number): number {
  const v = x / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance(c: RGB): number {
  return 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
}

/** WCAG contrast ratio between two colours. */
export function contrast(a: RGB, b: RGB): number {
  const A = luminance(a);
  const B = luminance(b);
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return a.map((x, i) => Math.round(x + (b[i] - x) * t)) as RGB;
}

function bestText(c: RGB): RGB {
  return contrast(c, WHITE) >= contrast(c, INK) ? WHITE : INK;
}

export interface BrandSet {
  brand: string;
  onBrand: string;
  hover: string;
  pressed: string;
  focus: string;
  link: string;
  textContrast: number;
}

export interface BrandCheck {
  ok: boolean;
  text: string;
}

export interface GeneratedBrand {
  neutral: boolean;
  base: string;
  light: BrandSet;
  dark: BrandSet;
  lightenedForDark: boolean;
  checks: BrandCheck[];
}

/** Turn one brand colour into the full set the client link needs, in light and dark. */
export function generateBrand(hex: string, mode: BrandMode): GeneratedBrand {
  const safe = isHex(hex) ? normalizeHex(hex) : NEUTRAL_HEX;
  const neutral = safe === NEUTRAL_HEX;
  const base = parse(safe);

  const onL = bestText(base);
  const awayL = onL === WHITE ? INK : WHITE;

  let d: RGB = neutral ? NEAR_WHITE : base;
  let lightened = false;
  for (let i = 0; i < 8 && !neutral && contrast(d, INK) < 3; i++) {
    d = mix(d, WHITE, 0.15);
    lightened = true;
  }
  const onD = bestText(d);
  const awayD = onD === WHITE ? INK : WHITE;

  const light: BrandSet = {
    brand: toHex(base),
    onBrand: toHex(onL),
    hover: toHex(mix(base, awayL, 0.15)),
    pressed: toHex(mix(base, awayL, 0.3)),
    focus: toHex(contrast(base, PAGE_LIGHT) >= 3 ? base : INK),
    link: toHex(contrast(base, WHITE) >= 4.5 ? base : INK),
    textContrast: contrast(base, onL),
  };
  const dark: BrandSet = {
    brand: toHex(d),
    onBrand: toHex(onD),
    hover: toHex(mix(d, awayD, 0.15)),
    pressed: toHex(mix(d, awayD, 0.3)),
    focus: toHex(contrast(d, INK) >= 3 ? d : NEAR_WHITE),
    link: toHex(contrast(d, SURFACE_DARK) >= 4.5 ? d : NEAR_WHITE),
    textContrast: contrast(d, onD),
  };

  const r1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
  const checks: BrandCheck[] = [];
  if (neutral) {
    checks.push({ ok: true, text: 'Neutral: client links use Monari black and white, inverting in dark mode.' });
  } else if (mode === 'primary') {
    checks.push({ ok: true, text: `Button text is ${onL === WHITE ? 'white' : 'black'} at ${r1(light.textContrast)}:1, above the 4.5:1 minimum.` });
    if (onL === INK) checks.push({ ok: false, text: 'This is a light colour, so buttons use black text.' });
  } else {
    checks.push({ ok: true, text: 'Buttons and top bars stay Monari black and white, so any colour works.' });
    if (contrast(base, WHITE) < 3) checks.push({ ok: false, text: 'Very light on white: the progress bar and pins will be hard to see. Try a deeper shade.' });
  }
  if (!neutral && light.link === toHex(INK)) checks.push({ ok: false, text: 'Too light for text on white, so links stay black.' });
  if (!neutral && light.focus === toHex(INK)) checks.push({ ok: false, text: 'Too close to the page colour for a focus ring, so focus rings stay black.' });
  if (lightened) checks.push({ ok: false, text: `Lightened to ${toHex(d)} in dark mode so it stays visible on the dark background.` });

  return { neutral, base: safe, light, dark, lightenedForDark: lightened, checks };
}

/**
 * CSS custom properties for a brand-scoped subtree (the client link).
 * `.brand-scope` in globals.css picks the light or dark set by theme.
 */
export function brandVars(branding: Branding): CSSProperties {
  const g = generateBrand(branding.hex, branding.mode);
  const primary = branding.mode === 'primary' && !g.neutral;
  const v = (light: string, dark: string, neutralLight = 'var(--inverse)', neutralDark = 'var(--inverse)') =>
    g.neutral ? [neutralLight, neutralDark] : [light, dark];

  const [bL, bD] = v(g.light.brand, g.dark.brand);
  const [oL, oD] = v(g.light.onBrand, g.dark.onBrand, 'var(--on-inverse)', 'var(--on-inverse)');
  const [lL, lD] = v(g.light.link, g.dark.link, 'var(--ink)', 'var(--ink)');
  const [fL, fD] = v(g.light.focus, g.dark.focus, 'var(--focus)', 'var(--focus)');

  return {
    '--brand-l': bL, '--brand-d': bD,
    '--on-brand-l': oL, '--on-brand-d': oD,
    '--link-l': lL, '--link-d': lD,
    '--focus-l': fL, '--focus-d': fD,
    '--primary-l': primary ? g.light.brand : 'var(--inverse)',
    '--primary-d': primary ? g.dark.brand : 'var(--inverse)',
    '--on-primary-l': primary ? g.light.onBrand : 'var(--on-inverse)',
    '--on-primary-d': primary ? g.dark.onBrand : 'var(--on-inverse)',
    '--primary-hover-l': primary ? g.light.hover : 'var(--inverse-hover)',
    '--primary-hover-d': primary ? g.dark.hover : 'var(--inverse-hover)',
  } as CSSProperties;
}

export const BRAND_PRESETS = [
  { label: 'Neutral', hex: '#141414' },
  { label: 'Electric blue', hex: '#0A1BFF' },
  { label: 'Forest', hex: '#1E4D3A' },
  { label: 'Tomato', hex: '#D93A1F' },
  { label: 'Plum', hex: '#5B2A4E' },
  { label: 'Butter', hex: '#F3D36B' },
];
