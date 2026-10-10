'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { BRANDS, DEFAULT_PREFS, MEMBERS, NOTIFICATIONS, PLANS, SHARE_LINKS, THREADS, WORKSPACE } from './mock-data';
import { DEFAULT_BRANDING } from './brand';
import type {
  AppNotification,
  Brand,
  Branding,
  Comment,
  Media,
  Member,
  MemberRole,
  NotificationEvent,
  NotificationPrefs,
  Plan,
  PlanTier,
  Post,
  Ratio,
  ShareLink,
  Status,
  Thread,
  Workspace,
} from './types';

interface State {
  /** False until per-browser settings (branding, guest name, unlocked links) are loaded after mount. */
  ready: boolean;
  workspace: Workspace;
  members: Member[];
  brands: Brand[];
  plans: Plan[];
  threads: Thread[];
  links: ShareLink[];
  notifications: AppNotification[];
  prefs: NotificationPrefs;
  /** Thread ids the current team member has opened. Everything else with activity is unread. */
  readThreadIds: string[];
  branding: Branding;
  guestName: string | null;
  /** Share-link tokens whose password was entered in this browser session. */
  unlockedTokens: string[];
}

type Action =
  | { type: 'hydrate'; patch: Partial<State> }
  | { type: 'reorder'; planId: string; from: number; to: number }
  | { type: 'updatePost'; planId: string; postId: string; patch: Partial<Post> }
  | { type: 'deletePost'; planId: string; postId: string }
  | { type: 'addPosts'; planId: string; posts: Post[] }
  | { type: 'setRatio'; planId: string; ratio: Ratio }
  | { type: 'addBrand'; brand: Brand }
  | { type: 'updateBrand'; brandId: string; patch: Partial<Brand> }
  | { type: 'addPlan'; plan: Plan }
  | { type: 'updatePlan'; planId: string; patch: Partial<Pick<Plan, 'name' | 'ratio'>> }
  | { type: 'addThread'; thread: Thread }
  | { type: 'updateThread'; threadId: string; patch: Partial<Thread> }
  | { type: 'reply'; threadId: string; comment: Comment }
  | { type: 'addLink'; link: ShareLink }
  | { type: 'revokeLink'; linkId: string }
  | { type: 'setBranding'; branding: Branding }
  | { type: 'setGuest'; name: string | null }
  | { type: 'unlock'; token: string }
  | { type: 'updateWorkspace'; patch: Partial<Workspace> }
  | { type: 'addMembers'; members: Member[] }
  | { type: 'updateMember'; memberId: string; patch: Partial<Member> }
  | { type: 'removeMember'; memberId: string }
  | { type: 'setPref'; event: NotificationEvent; channel: 'inApp' | 'email'; on: boolean }
  | { type: 'setDigest'; digest: NotificationPrefs['digest'] }
  | { type: 'readNotification'; id: string }
  | { type: 'readAllNotifications' }
  | { type: 'readThread'; threadId: string }
  | { type: 'readAllThreads'; threadIds: string[] };

function mapPlan(state: State, planId: string, fn: (plan: Plan) => Plan): State {
  return { ...state, plans: state.plans.map((p) => (p.id === planId ? fn(p) : p)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.patch, ready: true };
    case 'reorder':
      return mapPlan(state, action.planId, (plan) => {
        const posts = plan.posts.slice();
        const [moved] = posts.splice(action.from, 1);
        posts.splice(action.to, 0, moved);
        return { ...plan, posts, updated: 'just now' };
      });
    case 'updatePost':
      return mapPlan(state, action.planId, (plan) => ({
        ...plan,
        updated: 'just now',
        posts: plan.posts.map((p) => (p.id === action.postId ? { ...p, ...action.patch } : p)),
      }));
    case 'deletePost':
      return mapPlan(state, action.planId, (plan) => ({ ...plan, posts: plan.posts.filter((p) => p.id !== action.postId) }));
    case 'addPosts':
      return mapPlan(state, action.planId, (plan) => ({ ...plan, posts: [...action.posts, ...plan.posts], updated: 'just now' }));
    case 'setRatio':
      return mapPlan(state, action.planId, (plan) => ({ ...plan, ratio: action.ratio }));
    case 'addBrand':
      return { ...state, brands: [action.brand, ...state.brands] };
    case 'updateBrand':
      return { ...state, brands: state.brands.map((b) => (b.id === action.brandId ? { ...b, ...action.patch } : b)) };
    case 'addPlan':
      return { ...state, plans: [...state.plans, action.plan] };
    case 'updatePlan':
      return mapPlan(state, action.planId, (plan) => ({ ...plan, ...action.patch, updated: 'just now' }));
    case 'addThread':
      return { ...state, threads: [...state.threads, action.thread] };
    case 'updateThread':
      return { ...state, threads: state.threads.map((t) => (t.id === action.threadId ? { ...t, ...action.patch } : t)) };
    case 'reply':
      return {
        ...state,
        threads: state.threads.map((t) => (t.id === action.threadId ? { ...t, comments: [...t.comments, action.comment] } : t)),
      };
    case 'addLink':
      return { ...state, links: [action.link, ...state.links] };
    case 'revokeLink':
      return { ...state, links: state.links.map((l) => (l.id === action.linkId ? { ...l, revoked: 'today' } : l)) };
    case 'setBranding':
      return { ...state, branding: action.branding };
    case 'setGuest':
      return { ...state, guestName: action.name };
    case 'unlock':
      return state.unlockedTokens.includes(action.token) ? state : { ...state, unlockedTokens: [...state.unlockedTokens, action.token] };
    case 'updateWorkspace':
      return { ...state, workspace: { ...state.workspace, ...action.patch } };
    case 'addMembers':
      return { ...state, members: [...state.members, ...action.members] };
    case 'updateMember':
      return { ...state, members: state.members.map((m) => (m.id === action.memberId ? { ...m, ...action.patch } : m)) };
    case 'removeMember':
      return { ...state, members: state.members.filter((m) => m.id !== action.memberId) };
    case 'setPref':
      return {
        ...state,
        prefs: {
          ...state.prefs,
          events: { ...state.prefs.events, [action.event]: { ...state.prefs.events[action.event], [action.channel]: action.on } },
        },
      };
    case 'setDigest':
      return { ...state, prefs: { ...state.prefs, digest: action.digest } };
    case 'readNotification':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case 'readAllNotifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'readThread':
      return state.readThreadIds.includes(action.threadId) ? state : { ...state, readThreadIds: [...state.readThreadIds, action.threadId] };
    case 'readAllThreads':
      return { ...state, readThreadIds: Array.from(new Set([...state.readThreadIds, ...action.threadIds])) };
    default:
      return state;
  }
}

const INITIAL: State = {
  ready: false,
  workspace: WORKSPACE,
  members: MEMBERS,
  brands: BRANDS,
  plans: PLANS,
  threads: THREADS,
  links: SHARE_LINKS,
  notifications: NOTIFICATIONS,
  prefs: DEFAULT_PREFS,
  // Resolved threads and the oldest open one start as read so the inbox shows a realistic mix.
  readThreadIds: ['t4', 't7'],
  branding: DEFAULT_BRANDING,
  guestName: null,
  unlockedTokens: [],
};

let uid = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

/** URL-safe id from a name, unique against `taken`. */
export function slugify(name: string, taken: string[] = []): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'item';
  let slug = base;
  let n = 2;
  while (taken.includes(slug)) slug = `${base}-${n++}`;
  return slug;
}

function useActions(dispatch: (a: Action) => void, stateRef: React.MutableRefObject<State>) {
  const findPost = useCallback(
    (planId: string, postId: string) => stateRef.current.plans.find((p) => p.id === planId)?.posts.find((p) => p.id === postId),
    [stateRef],
  );

  return useMemo(() => {
    const nextNumber = (planId: string) =>
      stateRef.current.threads.filter((t) => t.planId === planId).reduce((m, t) => Math.max(m, t.number), 0) + 1;

    return {
      // Posts
      reorder: (planId: string, from: number, to: number) => dispatch({ type: 'reorder', planId, from, to }),
      move: (planId: string, postId: string, dir: -1 | 1) => {
        const plan = stateRef.current.plans.find((p) => p.id === planId);
        if (!plan) return;
        const from = plan.posts.findIndex((p) => p.id === postId);
        const to = from + dir;
        if (from < 0 || to < 0 || to >= plan.posts.length) return;
        dispatch({ type: 'reorder', planId, from, to });
      },
      setStatus: (planId: string, postId: string, status: Status) => dispatch({ type: 'updatePost', planId, postId, patch: { status } }),
      /** Editing a caption is a new version; an approved post goes back to review. */
      commitCaption: (planId: string, postId: string, caption: string) => {
        const post = findPost(planId, postId);
        if (!post || post.caption === caption) return;
        dispatch({
          type: 'updatePost', planId, postId,
          patch: { caption, version: post.version + 1, status: post.status === 'approved' ? 'review' : post.status },
        });
      },
      setCover: (planId: string, postId: string, coverIndex: number) => dispatch({ type: 'updatePost', planId, postId, patch: { coverIndex } }),
      addSlides: (planId: string, postId: string, media: Media[]) => {
        const post = findPost(planId, postId);
        if (!post) return;
        dispatch({
          type: 'updatePost', planId, postId,
          patch: { slides: [...post.slides, ...media], type: 'carousel', version: post.version + 1, status: post.status === 'approved' ? 'review' : post.status },
        });
      },
      /** A replaced image is a new version. Pins on the old one stay, labelled "On previous version". */
      replaceSlide: (planId: string, postId: string, index: number, media: Media) => {
        const post = findPost(planId, postId);
        if (!post) return;
        const slides = post.slides.slice();
        slides[index] = media;
        dispatch({
          type: 'updatePost', planId, postId,
          patch: { slides, version: post.version + 1, status: post.status === 'approved' ? 'review' : post.status },
        });
      },
      deletePost: (planId: string, postId: string) => dispatch({ type: 'deletePost', planId, postId }),
      addPosts: (planId: string, posts: Post[]) => dispatch({ type: 'addPosts', planId, posts }),
      setRatio: (planId: string, ratio: Ratio) => dispatch({ type: 'setRatio', planId, ratio }),

      // Brands and plans
      /** Adds a brand and returns it. `id` is derived from the name; colours default to a neutral avatar. */
      addBrand: (input: Omit<Brand, 'id' | 'initial' | 'swatches' | 'avatarBg' | 'avatarFg'> & Partial<Pick<Brand, 'avatarBg' | 'avatarFg' | 'swatches'>>) => {
        const id = slugify(input.name, stateRef.current.brands.map((b) => b.id));
        const brand: Brand = {
          avatarBg: '#141414',
          avatarFg: '#ffffff',
          swatches: [],
          ...input,
          id,
          initial: (input.name.trim()[0] ?? '?').toUpperCase(),
        };
        dispatch({ type: 'addBrand', brand });
        return brand;
      },
      updateBrand: (brandId: string, patch: Partial<Brand>) => dispatch({ type: 'updateBrand', brandId, patch }),
      /** Adds an empty plan and returns it. */
      addPlan: (brandId: string, name: string, ratio: Ratio) => {
        const id = slugify(name, stateRef.current.plans.map((p) => p.id));
        const plan: Plan = { id, brandId, name: name.trim(), ratio, updated: 'just now', posts: [] };
        dispatch({ type: 'addPlan', plan });
        return plan;
      },
      updatePlan: (planId: string, patch: Partial<Pick<Plan, 'name' | 'ratio'>>) => dispatch({ type: 'updatePlan', planId, patch }),

      // Comments
      addThread: (t: Omit<Thread, 'id' | 'number'>) => {
        const thread: Thread = { ...t, id: newId('t'), number: nextNumber(t.planId) };
        dispatch({ type: 'addThread', thread });
        return thread;
      },
      reply: (threadId: string, author: string, role: Comment['role'], body: string) =>
        dispatch({ type: 'reply', threadId, comment: { id: newId('c'), author, role, body, at: 'now' } }),
      setThreadStatus: (threadId: string, status: Thread['status']) => dispatch({ type: 'updateThread', threadId, patch: { status } }),
      keepOnVersion: (threadId: string, version: number) => dispatch({ type: 'updateThread', threadId, patch: { onVersion: version } }),
      readThread: (threadId: string) => dispatch({ type: 'readThread', threadId }),
      readAllThreads: (threadIds: string[]) => dispatch({ type: 'readAllThreads', threadIds }),

      // Client review
      approve: (planId: string, postId: string) => dispatch({ type: 'updatePost', planId, postId, patch: { status: 'approved' } }),
      /** "Request changes" always carries a comment, stored as a whole-post client thread. */
      requestChanges: (planId: string, postId: string, author: string, body: string) => {
        const post = findPost(planId, postId);
        dispatch({ type: 'updatePost', planId, postId, patch: { status: 'changes' } });
        dispatch({
          type: 'addThread',
          thread: {
            id: newId('t'), planId, postId, number: nextNumber(planId), slideIndex: null, x: null, y: null,
            visibility: 'client', status: 'open', onVersion: post?.version ?? 1,
            comments: [{ id: newId('c'), author, role: 'client', body, at: 'now' }],
          },
        });
      },
      setGuest: (name: string | null) => dispatch({ type: 'setGuest', name }),
      /** Marks a password-protected link as unlocked for this browser session. */
      unlock: (token: string) => dispatch({ type: 'unlock', token }),

      // Share links
      addLink: (link: Omit<ShareLink, 'id'>) => dispatch({ type: 'addLink', link: { ...link, id: newId('l') } }),
      revokeLink: (linkId: string) => dispatch({ type: 'revokeLink', linkId }),

      // Workspace settings
      setBranding: (branding: Branding) => dispatch({ type: 'setBranding', branding }),
      updateWorkspace: (patch: Partial<Workspace>) => dispatch({ type: 'updateWorkspace', patch }),
      changeTier: (tier: PlanTier) => dispatch({ type: 'updateWorkspace', patch: { tier } }),
      /** Creates pending invites. Emails already in the workspace are skipped; returns the ones added. */
      invite: (emails: string[], role: MemberRole) => {
        const taken = stateRef.current.members.map((m) => m.email.toLowerCase());
        const fresh = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))).filter((e) => !taken.includes(e));
        const members: Member[] = fresh.map((email) => ({
          id: newId('m'),
          name: email.split('@')[0],
          email,
          role,
          status: 'invited',
          meta: 'Invited today',
        }));
        if (members.length) dispatch({ type: 'addMembers', members });
        return members;
      },
      resendInvite: (memberId: string) => dispatch({ type: 'updateMember', memberId, patch: { meta: 'Invite resent today' } }),
      setMemberRole: (memberId: string, role: MemberRole) => dispatch({ type: 'updateMember', memberId, patch: { role } }),
      removeMember: (memberId: string) => dispatch({ type: 'removeMember', memberId }),
      setPref: (event: NotificationEvent, channel: 'inApp' | 'email', on: boolean) => dispatch({ type: 'setPref', event, channel, on }),
      setDigest: (digest: NotificationPrefs['digest']) => dispatch({ type: 'setDigest', digest }),

      // Notifications
      readNotification: (id: string) => dispatch({ type: 'readNotification', id }),
      readAllNotifications: () => dispatch({ type: 'readAllNotifications' }),
    };
  }, [dispatch, findPost, stateRef]);
}

type Actions = ReturnType<typeof useActions>;
const StoreContext = createContext<{ state: State; actions: Actions } | null>(null);

const BRANDING_KEY = 'gp-branding';
const GUEST_KEY = 'gp-guest';
const UNLOCKED_KEY = 'gp-unlocked';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const stateRef = useRef(state);
  stateRef.current = state;
  const actions = useActions(dispatch, stateRef);

  // Per-browser settings only. Everything else resets on reload until there is a backend.
  useEffect(() => {
    const patch: Partial<State> = {};
    try {
      const b = JSON.parse(localStorage.getItem(BRANDING_KEY) || 'null');
      if (b && typeof b.hex === 'string') patch.branding = { ...DEFAULT_BRANDING, ...b };
      const g = localStorage.getItem(GUEST_KEY);
      if (g) patch.guestName = g;
      const u = JSON.parse(sessionStorage.getItem(UNLOCKED_KEY) || '[]');
      if (Array.isArray(u)) patch.unlockedTokens = u.filter((x) => typeof x === 'string');
    } catch {
      /* storage unavailable: keep defaults */
    }
    dispatch({ type: 'hydrate', patch });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(state.branding));
      if (state.guestName) localStorage.setItem(GUEST_KEY, state.guestName);
      sessionStorage.setItem(UNLOCKED_KEY, JSON.stringify(state.unlockedTokens));
    } catch {
      /* ignore: quota or private mode */
    }
  }, [state.ready, state.branding, state.guestName, state.unlockedTokens]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function usePlan(planId: string) {
  const { state } = useStore();
  const plan = state.plans.find((p) => p.id === planId) ?? null;
  const brand = plan ? state.brands.find((b) => b.id === plan.brandId) ?? null : null;
  return { plan, brand };
}

/** Today's date as YYYY-MM-DD in the browser's local time. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type LinkState = 'missing' | 'revoked' | 'expired' | 'locked' | 'open';

/**
 * Resolves a share token the way the server will: missing or revoked links show nothing,
 * expired links say so, password links stay locked until unlocked this session.
 */
export function usePlanByToken(token: string) {
  const { state } = useStore();
  const link = state.links.find((l) => l.token === token) ?? null;
  const plan = link ? state.plans.find((p) => p.id === link.planId) ?? null : null;
  const brand = plan ? state.brands.find((b) => b.id === plan.brandId) ?? null : null;
  let linkState: LinkState = 'open';
  if (!link || !plan) linkState = 'missing';
  else if (link.revoked) linkState = 'revoked';
  else if (link.expiresAt && link.expiresAt < todayIso()) linkState = 'expired';
  else if (link.password && !state.unlockedTokens.includes(token)) linkState = 'locked';
  const usable = linkState === 'open';
  return { link: usable ? link : null, plan: usable ? plan : null, brand: usable ? brand : null, rawLink: link, rawPlan: plan, rawBrand: brand, linkState };
}
