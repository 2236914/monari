'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, ExternalLink, Upload } from 'lucide-react';
import { useStore } from '@/lib/store';
import { BRAND_PRESETS, brandVars, generateBrand, isHex, normalizeHex } from '@/lib/brand';
import type { BrandMode, Branding } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { StatusTag } from '@/components/ui/StatusTag';
import { LogoTile } from '@/components/ui/Avatars';
import { CommentPin } from '@/components/ui/CommentPin';
import { PostArt } from '@/components/PostArt';
import styles from './branding.module.css';

const SETTINGS_NAV = ['Workspace', 'Members', 'Branding', 'Notifications', 'Billing'];

export default function BrandingPage() {
  const { state, actions } = useStore();
  const [draft, setDraft] = useState<Branding>(state.branding);
  const [hexText, setHexText] = useState(state.branding.hex);
  const [saved, setSaved] = useState(true);

  // The store loads saved branding after mount; follow it until the user edits.
  useEffect(() => {
    if (saved) {
      setDraft(state.branding);
      setHexText(state.branding.hex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.branding]);

  const gen = useMemo(() => generateBrand(draft.hex, draft.mode), [draft.hex, draft.mode]);
  const hexBad = !isHex(hexText);
  const primary = draft.mode === 'primary';

  function update(patch: Partial<Branding>) {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  }

  function setHex(value: string) {
    setHexText(value);
    if (isHex(value)) update({ hex: normalizeHex(value) });
    else setSaved(false);
  }

  const tokens = [
    { name: 'Brand', light: gen.light.brand, dark: gen.dark.brand, use: primary ? 'Main buttons, top bars, logo tile, pins, progress' : 'Logo tile, comment pins, progress bar. Buttons stay black.' },
    ...(primary
      ? [
          { name: 'Hover', light: gen.light.hover, dark: gen.dark.hover, use: 'Main buttons on hover' },
          { name: 'Pressed', light: gen.light.pressed, dark: gen.dark.pressed, use: 'Main buttons while pressed' },
        ]
      : []),
    { name: 'Text on brand', light: gen.light.onBrand, dark: gen.dark.onBrand, use: `Labels on a brand fill · ${gen.light.textContrast.toFixed(1)}:1 light, ${gen.dark.textContrast.toFixed(1)}:1 dark` },
    { name: 'Focus ring', light: gen.light.focus, dark: gen.dark.focus, use: 'Keyboard focus outline on the client link' },
    { name: 'Links', light: gen.light.link, dark: gen.dark.link, use: 'Text links like “View all comments”' },
  ];

  const name = draft.name.trim() || 'your agency';

  return (
    <div className={styles.layout}>
      <nav aria-label="Settings" className={styles.side}>
        <ul>
          {SETTINGS_NAV.map((s) => (
            <li key={s}>
              {s === 'Branding' ? (
                <Link href="/settings/branding" aria-current="page" className={styles.sideOn}>Branding<span className="label" style={{ color: 'inherit' }}>Agency</span></Link>
              ) : (
                <a href={`#${s.toLowerCase()}`} className={styles.sideLink}>{s}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <main className={styles.main}>
        <div className="row wrap between gap-4" style={{ alignItems: 'flex-end' }}>
          <div className="stack gap-2" style={{ maxWidth: 640 }}>
            <h1 className="t-display">Branding</h1>
            <p className="ink-2">Your logo and colour on every client review link. Your team&apos;s app stays black and white so posts are judged on their own colours.</p>
          </div>
          <div className="row gap-2">
            <button type="button" className="btn btn-quiet" onClick={() => { update({ hex: '#141414' }); setHexText('#141414'); }}>Reset to neutral</button>
            <button type="button" className="btn btn-primary" onClick={() => { actions.setBranding(draft); setSaved(true); }} disabled={saved}>
              {saved ? <><Icon icon={Check} />Saved</> : 'Save branding'}
            </button>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.form}>
            <section aria-labelledby="logo-h" className="stack gap-3">
              <h2 id="logo-h" className="t-title">Logo</h2>
              <div className={styles.logoBox} style={brandVars(draft)}>
                <span className="brand-scope"><LogoTile name={draft.name} size={56} /></span>
                <div className="stack grow" style={{ flexBasis: 200 }}>
                  <span className="t-strong">No logo yet</span>
                  <span className="hint">SVG or PNG, at least 256px wide. Until you add one, links show your initial on your colour.</span>
                </div>
                <button type="button" className="btn"><Icon icon={Upload} />Upload logo</button>
              </div>
            </section>

            <section aria-labelledby="name-h" className="field">
              <h2 id="name-h" className="t-title" style={{ marginBottom: 4 }}>Name on links</h2>
              <label htmlFor="display-name" className="label">Display name</label>
              <input id="display-name" className="input" style={{ maxWidth: 360 }} value={draft.name} onChange={(e) => update({ name: e.target.value })} />
              <span className="hint">Clients see “Shared by {name}”.</span>
            </section>

            <section aria-labelledby="color-h" className="stack gap-3">
              <h2 id="color-h" className="t-title">Brand colour</h2>
              <span className="t-small ink-2">Pick one colour. We work out the rest and keep every combination readable.</span>
              <div className="row wrap gap-2" style={{ alignItems: 'flex-start' }}>
                <label htmlFor="picker" className="sr-only">Colour picker</label>
                <input id="picker" type="color" className={styles.picker} value={gen.base.toLowerCase()} onChange={(e) => setHex(e.target.value)} />
                <label htmlFor="hex" className="sr-only">Hex code</label>
                <input id="hex" className={`input ${styles.hex}`} value={hexText} onChange={(e) => setHex(e.target.value)} spellCheck={false} aria-invalid={hexBad || undefined} aria-describedby={hexBad ? 'hex-error' : undefined} />
              </div>
              {hexBad && <span id="hex-error" className="error-text">Error: Use a 6-digit hex code, like #0A1BFF. The preview keeps your last valid colour.</span>}
              <div className="row wrap gap-2">
                {BRAND_PRESETS.map((p) => (
                  <button key={p.hex} type="button" className={styles.preset} aria-pressed={gen.base === p.hex} onClick={() => setHex(p.hex)}>
                    <span style={{ background: p.hex }} />{p.label}
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="mode-h" className="stack gap-3">
              <h2 id="mode-h" className="t-title">Use the colour as</h2>
              <div className={styles.modes} style={brandVars({ ...draft })}>
                {(['highlight', 'primary'] as BrandMode[]).map((m) => (
                  <button key={m} type="button" className={styles.mode} aria-pressed={draft.mode === m} onClick={() => update({ mode: m })}>
                    <span className="row between gap-2">
                      <span className="t-strong">{m === 'highlight' ? 'Highlight' : 'Primary'}</span>
                      {m === 'highlight' && <span className="role-tag">Recommended</span>}
                    </span>
                    <span className="row gap-2 brand-scope" aria-hidden="true" style={brandVars({ ...draft, mode: m })}>
                      <span style={{ width: 22, height: 22, background: 'var(--brand)' }} />
                      <span style={{ flex: 1, height: 4, background: 'var(--sunk)' }}><span style={{ display: 'block', width: '60%', height: 4, background: 'var(--brand)' }} /></span>
                      <span className="t-small t-strong" style={{ height: 28, padding: '0 10px', display: 'inline-flex', alignItems: 'center', background: 'var(--primary)', color: 'var(--on-primary)' }}>Approve</span>
                    </span>
                    <span className="t-small ink-2">
                      {m === 'highlight'
                        ? 'Buttons and bars stay black. Your colour marks the logo, comment pins, progress and links.'
                        : 'Your colour replaces black on main buttons and the top bars, for a fully branded link.'}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="gen-h" className="stack gap-3">
              <div className="row wrap between gap-2" style={{ alignItems: 'baseline' }}>
                <h2 id="gen-h" className="t-title">Generated colours</h2>
                <span className="t-meta ink-3">From {gen.base}</span>
              </div>
              <div className="card scroll-x">
                <table className="table" style={{ minWidth: 520 }}>
                  <thead><tr><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Used for</th></tr></thead>
                  <tbody>
                    {tokens.map((t) => (
                      <tr key={t.name}>
                        <td className="t-strong" style={{ whiteSpace: 'nowrap' }}>{t.name}</td>
                        <td><span className={styles.swatch}><span style={{ background: t.light }} />{t.light}</span></td>
                        <td><span className={styles.swatch}><span style={{ background: t.dark }} />{t.dark}</span></td>
                        <td className="t-small ink-2">{t.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className={styles.checks}>
                {gen.checks.map((c) => (
                  <li key={c.text}>
                    <span className={c.ok ? styles.ok : styles.warn} aria-hidden="true">{c.ok ? <Icon icon={Check} size={12} /> : '!'}</span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="neutral-h" className={`stack gap-3 ${styles.neutral}`}>
              <h2 id="neutral-h" className="t-strong">Always stays neutral</h2>
              <div className="row wrap gap-2"><StatusTag status="approved" /><StatusTag status="changes" /><StatusTag status="review" /></div>
              <span className="t-small ink-2">Review statuses, the Instagram profile mock and your team&apos;s app never take the brand colour, so “approved” can&apos;t be confused with a post&apos;s own colours.</span>
            </section>
          </div>

          <aside aria-label="Client link preview" className={styles.previewCol}>
            <div className="row between gap-2" style={{ alignItems: 'baseline' }}>
              <h2 className="t-title">Client link preview</h2>
              <Link href="/s/k7Qm2xV9pLr4" target="_blank" className="row gap-1 t-small ink-2"><Icon icon={ExternalLink} />Open the real link</Link>
            </div>
            <span className="t-small ink-3">{saved ? 'This is what clients see now.' : 'Save to apply this to client links.'}</span>
            <div className={styles.previews}>
              {(['light', 'dark'] as const).map((theme) => {
                const set = gen[theme];
                const vars = {
                  '--brand': gen.neutral ? 'var(--inverse)' : set.brand,
                  '--on-brand': gen.neutral ? 'var(--on-inverse)' : set.onBrand,
                  '--primary': primary && !gen.neutral ? set.brand : 'var(--inverse)',
                  '--on-primary': primary && !gen.neutral ? set.onBrand : 'var(--on-inverse)',
                  '--brand-link': gen.neutral ? 'var(--ink)' : set.link,
                } as React.CSSProperties;
                return (
                  <div key={theme} className="stack gap-2" style={{ flex: '1 1 250px', minWidth: 0 }}>
                    <span className="t-meta ink-3">{theme === 'light' ? 'Light' : 'Dark'} · {primary ? 'Primary' : 'Highlight'}</span>
                    <div className={`${styles.mini} ${theme === 'dark' ? styles.miniDark : styles.miniLight}`} style={vars}>
                      <div className={styles.miniBar}>
                        <LogoTile name={draft.name} size={26} />
                        <span className="stack" style={{ minWidth: 0 }}>
                          <span className="t-strong" style={{ fontSize: 13, lineHeight: '18px' }}>October launch</span>
                          <span className="t-meta" style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Shared by {name}</span>
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <PostArt art={13} />
                        <CommentPin x={0.55} y={0.38} initial="L" tone="brand" active size={36} />
                      </div>
                      <div className="stack gap-2" style={{ padding: 10, fontSize: 13, lineHeight: '18px' }}>
                        <span className="row between gap-2"><span className="t-strong">7 of 12 reviewed</span><StatusTag status="approved" /></span>
                        <span style={{ display: 'block', height: 4, background: 'var(--sunk)' }}><span style={{ display: 'block', width: '58%', height: 4, background: 'var(--brand)' }} /></span>
                        <span className="row gap-2">
                          <span className={styles.miniBtn} style={{ border: '1px solid var(--line)' }}>Comment</span>
                          <span className={styles.miniBtn} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><Icon icon={Check} size={12} />Approve</span>
                        </span>
                        <span className="t-strong" style={{ fontSize: 12, color: 'var(--brand-link)', textDecoration: 'underline' }}>View all comments</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
