export type Status = 'approved' | 'changes' | 'review' | 'scheduled' | 'draft';
export type PostType = 'post' | 'carousel' | 'reel';
export type Ratio = '3:4' | '4:5' | '1:1';

/** A slide is either one of the built-in sample artworks or an uploaded file (object URL). */
export type Media =
  | { kind: 'art'; art: number }
  | { kind: 'image'; url: string; name: string }
  | { kind: 'video'; url: string; name: string };

export interface Post {
  id: string;
  type: PostType;
  slides: Media[];
  coverIndex: number;
  caption: string;
  status: Status;
  version: number;
  reelLength?: string;
}

export interface Plan {
  id: string;
  brandId: string;
  name: string;
  ratio: Ratio;
  updated: string;
  /** Newest first: index 0 is the top-left tile. */
  posts: Post[];
}

export interface Brand {
  id: string;
  name: string;
  username: string;
  displayName: string;
  category: string;
  bio: string;
  link: string;
  followers: string;
  following: string;
  avatarBg: string;
  avatarFg: string;
  initial: string;
  /** Uploaded profile picture (data URL, resized). Falls back to the initial on avatarBg. */
  avatarUrl?: string | null;
  swatches: string[];
}

export type Role = 'client' | 'team';

export interface Comment {
  id: string;
  author: string;
  role: Role;
  body: string;
  at: string;
}

export interface Thread {
  id: string;
  planId: string;
  postId: string;
  number: number;
  slideIndex: number | null;
  /** 0–1 fractions of the original image. Null for whole-post threads. */
  x: number | null;
  y: number | null;
  visibility: 'client' | 'internal';
  status: 'open' | 'resolved';
  onVersion: number;
  comments: Comment[];
}

export interface ShareLink {
  id: string;
  planId: string;
  token: string;
  mode: 'view' | 'approve';
  allowComments: boolean;
  password: boolean;
  /**
   * Frontend-only stand-in so the password screen can be tried. The real app stores
   * only a hash on the server and never sends it to the browser.
   */
  passwordValue?: string | null;
  /** Display label, e.g. "31 Oct". */
  expires: string | null;
  /** ISO date (YYYY-MM-DD). The link stops working at the end of this day. */
  expiresAt?: string | null;
  views: number;
  created: string;
  revoked: string | null;
}

export type BrandMode = 'highlight' | 'primary';

export interface Branding {
  hex: string;
  mode: BrandMode;
  name: string;
  /** Agency logo for client links (data URL, resized to at most 256px). Null shows the initial. */
  logoUrl?: string | null;
}

export type MemberRole = 'Owner' | 'Member';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: 'active' | 'invited';
  /** "2h ago" for active members, "Invited 3 Oct" for pending invites. */
  meta: string;
}

export type PlanTier = 'solo' | 'studio' | 'agency';

export interface Workspace {
  name: string;
  slug: string;
  defaultRatio: Ratio;
  timezone: string;
  tier: PlanTier;
  /** e.g. "12 Nov 2026" */
  renews: string;
  storageUsedGb: number;
}

export type NotificationEvent = 'changes' | 'approved' | 'comment' | 'mention' | 'reply' | 'link-opened';

export interface NotificationPrefs {
  events: Record<NotificationEvent, { inApp: boolean; email: boolean }>;
  digest: 'off' | 'daily' | 'weekly';
}

export interface AppNotification {
  id: string;
  type: NotificationEvent;
  who: string;
  role: Role;
  /** Sentence after the name, e.g. "requested changes on Post 8". */
  text: string;
  planId: string;
  postId?: string;
  threadId?: string;
  at: string;
  read: boolean;
}
