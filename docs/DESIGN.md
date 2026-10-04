# DESIGN.md: Monari

The design system for every tool in this repo. The interface stays out of the way of the work: the work carries the colour, the UI is black, white and grey. Flat, square, built from full-bleed blocks and hard 1px lines. Tokens are implemented in [`grid-planner/app/globals.css`](../grid-planner/app/globals.css).

## Principles

- **Neutral only.** Every colour is a step on one black-to-white scale. No hue, no tints, no brand accent in the chrome.
- **Square.** Radius 0 on everything. Round is for avatars only (and the Instagram mock).
- **Flat.** No gradients, shadows or blur. Separate things with a `line` border or a different block. The one exception is the comment pin's shadow, so it lifts off busy images.
- **Bleed, don't box.** Big areas are solid blocks edge to edge (`inverse`, `block`, `surface-sunk`), stacked directly against each other.

## Content

- Sentence case everywhere. Buttons start with a verb: "Upload posts", "Request changes".
- Plain, short, second person. No exclamation marks, no emoji.
- Numbers and metadata go in `meta`: "Post 3 of 9 · 6 slides".
- Field labels and status tags are uppercase `label`. Nothing else is uppercase.
- Errors are words that start with "Error:", never colour alone.

## Colour

Scale `n-0` (#ffffff) to `n-1000` (#000000). Use semantic tokens, never scale steps:

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | n-50 | n-950 | Page |
| `surface` | n-0 | n-900 | Cards, inputs, tiles (with a `line` edge) |
| `surface-sunk` | n-100 | n-800 | Recessed fills, Scheduled tag |
| `ink` / `ink-2` / `ink-3` | n-950 / n-700 / n-600 | n-50 / n-300 / n-400 | Primary / secondary / metadata text |
| `line` / `line-soft` | n-950 / n-200 | n-50 / n-800 | Structural / decorative borders |
| `inverse` / `on-inverse` | n-950 / n-0 | n-50 / n-950 | Primary button, selected, Approved, hero bands |
| `block` / `on-block` | n-200 / n-950 | n-700 / n-50 | Grey bleed block, In review tag |
| `focus` | n-950 | n-50 | 2px outline, 2px offset |

## Type

Instrument Sans for reading, IBM Plex Mono for labels and data.

| Style | Size / line | Weight | Use |
|---|---|---|---|
| display-xl | 64 / 60, -0.035em | 600 | Once per marketing page |
| display | 40 / 42, -0.025em | 600 | Page titles |
| title | 20 / 26, -0.01em | 600 | Card and dialog titles |
| body / body-strong | 15 / 22 | 400 / 600 | Everything else / button labels |
| small | 13 / 18 | 400 | Hints |
| label | Mono 11 / 16, 0.08em, uppercase | 500 | Field labels, tags |
| meta | Mono 12 / 16 | 400 | Counts, dates, sizes |

## Spacing and controls

- Spacing steps only: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- Controls: `control-sm` 32 (toolbars), `control-md` 40 (default), `control-lg` 48 (the one primary action on a page or phone sheet). Touch targets at least 44.
- Hover: inverse goes to `inverse-hover`; bordered controls fill with `surface-sunk`. Nothing moves.
- Disabled: `ink-3` text, `line-soft` edge, `cursor: not-allowed`.

## Status

Fill weight + icon + word, always all three:

| Status | Fill | Icon |
|---|---|---|
| Approved | solid `inverse` | check |
| Changes requested | `surface`, 2px `line` edge | triangle-alert |
| In review | `block` | clock |
| Scheduled | `surface-sunk`, hair edge | calendar |
| Draft | dashed hair edge | pencil |

## Icons

Lucide, stroke 1.5 (2 at 12px), square caps, miter joins, `currentColor`. 16px with text, 12px in tags, 20px standalone. An icon-only button needs an accessible name.

## Exceptions

- **The Instagram mock looks like Instagram:** system font, round avatar, rounded grey buttons, 3-column grid with 2px gaps.
- **Client link branding:** an agency can set one brand colour for its client links. In Highlight mode (recommended) it marks only the logo tile, comment pins, progress and links; in Primary mode it also replaces black on main buttons and top bars. Status tags, the Instagram mock and the agency app never take it.
