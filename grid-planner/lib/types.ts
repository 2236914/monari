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
  expires: string | null;
  views: number;
  created: string;
  revoked: string | null;
}

export type BrandMode = 'highlight' | 'primary';

export interface Branding {
  hex: string;
  mode: BrandMode;
  name: string;
}
