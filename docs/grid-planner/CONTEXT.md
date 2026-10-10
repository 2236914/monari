# CONTEXT.md — Grid Planner (web app)

Project context for anyone, human or AI, designing or building Grid Planner. Read this first, then `DESIGN.md` for the visual rules.

| | |
|---|---|
| **Product** | Grid Planner (working name) — an Instagram grid planning and client-approval web app |
| **Design system** | **Monari**: neutral black-to-white, square, flat, full-bleed blocks. Rules and tokens in `DESIGN.md` |
| **Icons** | Lucide, stroke 1.5, drawn in the surrounding text colour |
| **Owner** | Sean (Morpho) |
| **Status** | Prototype done; final UI designed; frontend UI built in `grid-planner/` with mock data; backend next |
| **Links** | Prototype: https://claude.ai/artifact/QUv7hC5wGrK8SBuRQkfUig · Design system: https://claude.ai/artifact/XWv3NdzM3J2ZSSb5cDeJ7u · Screen designs: https://claude.ai/artifact/R2P3RPf1tmr7xktPyMBXoN |
| **Companion files** | `../DESIGN.md` (Monari rules + tokens) · `../../grid-planner/README.md` (how the frontend is built) |

---

## 1. What it is

A web app where social media managers **plan an Instagram grid, show it to the client exactly as it will look, and get it approved**, all in one link.

**The job it does:**
1. Upload posts: single images, multi-slide carousels, reels.
2. Arrange them in an Instagram-accurate profile grid.
3. Write captions.
4. Send the client **one share link**. The client opens it on their phone with no login, sees the real-looking profile, **taps to drop Figma-style comments** on specific spots, and **approves or requests changes** post by post.
5. The team sees feedback live, fixes it, and exports what gets posted.

**Origin.** It grew out of real client work: planning, previewing and getting approval on Instagram launch grids for agency clients. Every step of that, from preview to feedback to approval to export, was manual. This app makes it one workflow.

---

## 2. Who it's for

| User | Context | Needs |
|---|---|---|
| **Agency owner / social media manager** (primary, paying) | Runs Instagram for 3–20 client brands. Desktop first, but checks on the phone | Plan fast, keep each brand separate, get approvals without chasing on WhatsApp, see what's blocking |
| **Team member** (designer, copywriter) | Logged in, part of the agency workspace | Upload, edit captions, resolve comments, talk internally without the client seeing |
| **Client** (no account) | Opens the link from WhatsApp, iMessage or email. **Phone first.** Not technical | See the feed as it will look, say what to change in the simplest way, approve |

**First customers:** small agencies and freelancers, starting with the owner's own agency and its clients as design partners.

---

## 3. The problem

- Clients approve posts one by one in chat threads, never seeing the **grid** as a whole.
- Feedback arrives as vague messages ("make the second one brighter"). Nobody knows which post, which slide or which spot.
- Visual planners (Later, Planoly) show a grid but don't do pinned feedback or no-login approval. Review tools (Filestage, Markup.io) do pinned feedback but don't show an **Instagram grid**.
- **Gap this app fills:** Instagram-accurate grid preview + spot-pinned, slide-aware comments + guest approval, in one link.

---

## 4. Scope

### V1 (MVP)
- **Workspaces and team:** sign up, a workspace per agency, invite members (roles: Owner, Member).
- **Brands:** one per client Instagram account: username, display name, bio, link, profile photo, follower/following counts (for the mock).
- **Plans:** a grid per brand (for example "October launch"). Multiple plans per brand.
- **Upload:**
  - Drag and drop or a file picker.
  - "One post each" or "One carousel".
  - Files are sorted by name, so post-1, post-2… land in posting order.
  - A single video becomes a reel, with an automatic cover frame.
  - Max 20 MB per file in V1.
- **Grid:**
  - Instagram-accurate profile mock, 3 columns, 2px gaps, 3:4 tiles (4:5 / 1:1 as options).
  - **Drag to reorder:** with a mouse, press and move. On touch, hold about 0.3s, then drag; a quick swipe still scrolls.
  - Top-left is the newest post. A posting-order numbers toggle.
- **Post panel:** slides, a carousel cover pick, add/remove slides, caption, status, version, move newer/older, delete.
- **Statuses:** Draft · In review · Changes requested · Approved · Scheduled.
- **Share links:** view-only or view + approve, allow comments, optional password and expiry, revoke, view count, and a grid image for link previews.
- **Client review page:**
  - The profile mock opens with no login.
  - Comment, Request changes and Approve.
  - The client gives their name once (email optional), at the first action.
- **Comments (Figma-style):** see section 6.
- **Notifications:** an in-app inbox, plus email for "changes requested", mentions and batched digests.
- **Export:** download a post's files and copy its caption.
- **Billing:** Stripe subscriptions.

### V1.5
- Reel comments at a timestamp.
- Caption text-range comments.
- "Approve with changes".
- Notification preferences, comment search.

### V2 / later
- **Site to grid:** paste a brand's website → extract its colours, fonts and tone → AI writes a 9-post plan with copy → renders on-brand slides into the planner.
- **Brand check:** measure every asset against the brand's values.
- Direct publishing and scheduling (Instagram API; Business/Creator accounts; requires Meta app review).
- Region/drawing annotations, version compare, TikTok/LinkedIn, analytics.

### Not doing (for now)
- Scheduling/auto-publishing in V1.
- An in-app image editor.
- Multi-platform.
- A public marketplace.

---

## 5. Core flows

**A. First run (agency)**
1. Sign up.
2. Name the workspace.
3. Add the first brand.
4. Upload posts.
5. See the grid.
6. Share.

**B. Plan a grid**
1. Open the plan.
2. Upload: files become posts.
3. Drag to arrange.
4. Open a post to set the carousel cover and write the caption.
5. Set the status to In review.
6. Share.

**C. Client review (phone)**
1. Open the link.
2. See the profile.
3. Tap a post: swipe slides, read the caption.
4. Do one of:
   - **Comment:** tap a spot, write.
   - **Request changes:** a comment is required.
   - **Approve.**
5. Name prompt, the first time only.
6. Next post.
7. Done: "All posts reviewed".

**D. Resolve feedback (agency)**
1. Get notified.
2. Open the plan with the comments panel.
3. Jump to the pin.
4. Fix: replace the image or edit the caption. The post version goes up.
5. Reply / resolve.
6. The post goes back to In review if it had been approved.
7. Re-share, or the client reloads.

---

## 6. Comments (decided approach)

**Built in-house on Supabase, not with an SDK.**
- An SDK would make internal-vs-client comments expensive (Liveblocks only has them on its $500/month plan).
- Approval status, post versions and share-link permissions all live in our own database anyway, so an SDK would mean keeping two systems in sync.
- Velt's free tier isn't allowed in production.
- Cord and SuperViz have shut down or are winding down.

**UX:**
- **Desktop:** press `C` or use the Comment toggle, then click a spot. A pin drops and a popover composer opens.
- **Phone:** tap "Comment", then tap a spot. A draggable pin appears and a bottom-sheet composer opens. **No long-press:** it clashes with the phone's image menus.
- Pins live in the **full post viewer**, not on the cropped 3:4 tiles. Tiles show a comment-count badge.

**What a comment attaches to:**
- a spot on an image/slide (x/y as **0–1 fractions of the original image**)
- a whole post
- the caption
- the whole grid
- later: a reel timestamp

**Threads:**
- Numbered (#1, #2…).
- Replies, reactions, resolve/unresolve, @mention team members.
- **Internal vs client visibility.** Internal threads never reach the client link, and this is enforced in the database.

**Approval coupling:**
- "Request changes" requires a comment.
- Decisions are stored per post version.
- Editing an approved post resets it to In review.

**When an image is replaced:**
- Pins stay, labelled "On previous version", with a thumbnail of the old crop.
- The team chooses "Keep on new version" or resolves the thread.

**Guests:**
- Supabase anonymous sign-in, created at the client's first comment or approval, with CAPTCHA.
- A guest row tied to the share link.
- Database (RLS) policies check that the link is active and the thread is client-visible.

**Live updates:** Supabase Realtime Broadcast on private channels per grid, with client and internal events kept separate.

**V1 effort estimate:** about 2–4 developer-weeks.

---

## 7. Share links

- **URL:** `/s/[token]`. The token is long and random, and **only its hash is stored**.
- **The server validates the link** (exists, not expired, not revoked) before loading anything.
- **Media stays private** in R2. The page gets short-lived signed URLs, so revoking a link cuts access straight away.
- **Options:**
  - mode: view / view + approve
  - allow comments
  - password
  - expiry
- **Link preview:** an automatically generated 3×3 grid image (Next.js OG image), so it shows as a picture in WhatsApp and iMessage.
- **Hidden from search engines (`noindex`) and rate-limited.**

---

## 8. Data model (first version)

```
workspaces            id, name, plan, stripe_customer_id
members               workspace_id, user_id, role
brands                id, workspace_id, username, display_name, bio, link, avatar_key, followers, following
plans                 id, brand_id, name, grid_ratio, created_by, updated_at
posts                 id, plan_id, position, type (post|carousel|reel), caption, status, version
media                 id, post_id, version, r2_key, kind (image|video), width, height, poster_key, slide_index
share_links           id, plan_id, token_hash, mode, allow_comments, password_hash, expires_at, revoked_at, views, created_by
guests                id, share_link_id, auth_uid, display_name, email, notify_email
comment_threads       id, plan_id, number, post_id, media_id, media_version, slide_index, anchor_type,
                      x, y, t_ms, caption_start, caption_end, snapshot_key, visibility, status,
                      created_by_member | created_by_guest, resolved_at
comments              id, thread_id, author_member | author_guest, body, mentions, edited_at, deleted_at
comment_reactions     comment_id, author, emoji
post_reviews          post_id, post_version, guest_id, decision (approved|changes_requested), thread_id
notifications         recipient, type, thread_id, payload, read_at, emailed_at
subscriptions         workspace_id, stripe ids, plan, status, period_end
```

Every table carries `workspace_id` (directly or through its parent) for RLS. Use soft deletes (`deleted_at`) wherever realtime is involved.

---

## 9. Tech stack

| Layer | Choice |
|---|---|
| App | **Next.js** (App Router, React, TypeScript) on **Vercel** |
| Styling | Monari tokens as CSS variables (`DESIGN.md`). Tailwind optional, mapped to tokens, with rounded corners and shadows disabled |
| Drag and drop | **dnd-kit** (sortable grid; mouse, touch and keyboard) |
| Database / auth / realtime | **Supabase** (Postgres, Auth incl. anonymous sign-in, RLS, Realtime Broadcast) |
| Media | **Cloudflare R2**, private bucket. Browser uploads with presigned URLs. Signed read URLs |
| Email | **Resend** (immediate for changes and mentions; batched digests via cron) |
| Payments | **Stripe Billing** (Checkout + Customer Portal) |
| AI (V2) | **Claude API** (brand extraction, copy) |
| Rendering worker (V2) | Headless Chrome + ffmpeg on Fly.io/Railway (PNG slides, MP4 reels) |
| Monitoring | PostHog + Sentry |

**Build order:**
1. Auth + workspaces
2. Brands and plans
3. Planner (upload to R2, dnd-kit grid, post panel)
4. Share links + client view
5. Comments + approvals
6. Notifications
7. Stripe

---

## 10. Design (summary — full rules in `DESIGN.md`)

- **Monari:**
  - **Colour:** neutral black-to-white only (13-step scale + semantic tokens, light and dark).
  - **Shape:** square everywhere (radius 0).
  - **Flat:** no gradients or shadows. Things are separated by full-bleed blocks and 1px lines.
  - **Type:** Instrument Sans + IBM Plex Mono.
- **Statuses** are shown by fill + icon + word (no colour):
  - Approved = solid black
  - Changes = thick outline
  - In review = grey
  - Scheduled = light grey
  - Draft = dashed
- **The posts are the only colour on screen.**
- **Exception: the Instagram mock looks like Instagram:** its system font, round avatar, rounded grey buttons, 3-column 3:4 grid with 2px gaps, light/dark like the app.
- **Exception: client link branding.** Agencies can set one brand colour for their client links (Highlight or Primary mode). Statuses and the Instagram mock stay neutral.
- **Design targets:** 1440 desktop and 390 mobile, light and dark, with empty/loading/error states.

---

## 11. Pricing (to test)

| Plan | Price | Includes |
|---|---|---|
| Solo | $19/mo | 1 brand, planner, share links, approvals |
| Studio | $49/mo | 5 brands, 3 seats, all exports |
| Agency | $129/mo | 20 brands, 10 seats, approval links under the agency's own branding |

AI features (V2) are sold as credits.

**Reference points:**
- Later Starter is about $18.75/mo on annual billing.
- Planoly Starter is about $14, Pro about $47.
- Predis Agency is about $249.

---

## 12. Success metrics

- **Time to first approved grid:** under a day.
- **% of share links that get at least one client action.**
- **Approvals per brand per month.**
- **Trial → paid conversion, and monthly churn.**
- **Later:** % of AI-generated slides kept without edits.

---

## 13. Glossary

| Term | Meaning |
|---|---|
| **Workspace** | An agency account; holds members, brands, billing |
| **Brand** | A client's Instagram account (one profile mock) |
| **Plan** | One grid for a brand (e.g. "October launch") |
| **Post** | One grid tile: single image, carousel (several slides) or reel |
| **Slide** | One image/video inside a carousel |
| **Share link** | A no-login URL showing a plan's grid to the client |
| **Guest** | A client using a share link (name, optional email) |
| **Thread / pin** | A comment conversation, optionally pinned to a spot on a slide |
| **Internal** | A thread only the agency team can see |
| **Version** | A post's revision; increases when media or caption changes |

---

## 14. Open decisions

1. **Final product name.** "Grid Planner" is a placeholder. Check the domain and trademark.
2. **Ownership:** a Morpho product or a standalone company.
3. **First market:** agencies (recommended) or individual professionals.
4. **Whether clients can resolve their own threads** (per-link setting in V1.5).
5. **Storage limits per plan,** given video sizes.
