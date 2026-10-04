# Grid Planner

Plan an Instagram grid, show it to the client exactly as it will look, and get it approved, all in one link. Product context lives in [`docs/grid-planner/CONTEXT.md`](../docs/grid-planner/CONTEXT.md); visual rules in [`docs/DESIGN.md`](../docs/DESIGN.md).

**This is the frontend only.** Everything runs on mock data in memory (`lib/mock-data.ts`). Uploads are real files shown through object URLs but are never sent anywhere. Branding, theme and the client's name are kept in `localStorage`; everything else resets on reload.

## Run it

```bash
cd grid-planner
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm run typecheck
```

## Screens

| Route | Screen |
|---|---|
| `/sign-in`, `/sign-up` | Sign in; four-step sign up (account, confirm email, workspace, first brand) |
| `/verify-email`, `/forgot-password`, `/reset-password` | Email confirmation, reset request, new password (`?expired=1` for the expired link) |
| `/invite/[token]` | Accept a team invite (`?expired=1` for the expired invite) |
| `/dashboard` | Headline numbers, approvals chart (with table view), share links, needs-action queue, week ahead, activity |
| `/brands` | Every client brand and its plans, with a status bar per plan |
| `/plans/[planId]` | The planner: Instagram-accurate grid, drag to reorder (mouse, touch hold, keyboard), post panel, share dialog |
| `/plans/[planId]/upload` | Drag-and-drop upload with progress, size errors and a live grid preview |
| `/plans/[planId]/posts/[postId]` | Post viewer: Figma-style pins (press `C`), client vs internal threads, replies, resolve, "on previous version" |
| `/settings/branding` | Agency logo, name and colour; generated light/dark tokens with contrast checks; Highlight or Primary mode |
| `/s/[token]` | Client review link (no login, phone first): profile grid, review progress |
| `/s/[token]/p/[postId]` | Client post: swipe carousel, tap to pin a comment, request changes (comment required), approve |
| `/s/[token]/done` | Review summary |

Try the sample client link at `/s/k7Qm2xV9pLr4`. Approving or requesting changes there updates the planner and dashboard in the same session.

## How it's built

- **Next.js App Router + TypeScript**, React 19.
- **Styling:** Monari tokens as CSS variables in `app/globals.css` (light, dark via `prefers-color-scheme`, and a manual override on `<html data-theme>`), plus CSS modules per screen. No Tailwind, no radius, no shadows except the comment pin.
- **Icons:** `lucide-react` through `components/ui/Icon.tsx` (1.5 stroke, square caps, miter joins).
- **Drag and drop:** `@dnd-kit` sortable grid with mouse, a 0.3s touch hold, and keyboard (Space to pick up, arrows, Space to drop).
- **State:** one reducer in `lib/store.tsx`. Swap its actions for Supabase calls when the backend arrives.
- **Branding:** `lib/brand.ts` turns one hex into the client link's colours, lightens it for dark mode when needed and picks readable text. Status tags and the Instagram mock never take the brand colour.
- **Sample posts:** `components/PostArt.tsx` draws flat-colour artwork for the fictional Halden Coffee brand, in container units so it scales from a thumbnail to a full slide.

## Next steps

1. Supabase auth (including anonymous guests for share links) and RLS.
2. Replace `lib/store.tsx` actions with database calls; R2 presigned uploads.
3. Realtime comments, Resend notifications, Stripe billing.
