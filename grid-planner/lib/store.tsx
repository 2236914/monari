'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { BRANDS, PLANS, SHARE_LINKS, THREADS } from './mock-data';
import { DEFAULT_BRANDING } from './brand';
import type { Brand, Branding, Comment, Media, Plan, Post, Ratio, ShareLink, Status, Thread } from './types';

interface State {
  brands: Brand[];
  plans: Plan[];
  threads: Thread[];
  links: ShareLink[];
  branding: Branding;
  guestName: string | null;
}

type Action =
  | { type: 'reorder'; planId: string; from: number; to: number }
  | { type: 'updatePost'; planId: string; postId: string; patch: Partial<Post> }
  | { type: 'deletePost'; planId: string; postId: string }
  | { type: 'addPosts'; planId: string; posts: Post[] }
  | { type: 'setRatio'; planId: string; ratio: Ratio }
  | { type: 'addThread'; thread: Thread }
  | { type: 'updateThread'; threadId: string; patch: Partial<Thread> }
  | { type: 'reply'; threadId: string; comment: Comment }
  | { type: 'addLink'; link: ShareLink }
  | { type: 'revokeLink'; linkId: string }
  | { type: 'setBranding'; branding: Branding }
  | { type: 'setGuest'; name: string | null };

function mapPlan(state: State, planId: string, fn: (plan: Plan) => Plan): State {
  return { ...state, plans: state.plans.map((p) => (p.id === planId ? fn(p) : p)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
    default:
      return state;
  }
}

const INITIAL: State = {
  brands: BRANDS,
  plans: PLANS,
  threads: THREADS,
  links: SHARE_LINKS,
  branding: DEFAULT_BRANDING,
  guestName: null,
};

let uid = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

function useActions(state: State, dispatch: (a: Action) => void) {
  const stateRef = useRef(state);
  stateRef.current = state;

  const findPost = useCallback((planId: string, postId: string) => {
    return stateRef.current.plans.find((p) => p.id === planId)?.posts.find((p) => p.id === postId);
  }, []);

  return useMemo(() => {
    const nextNumber = (planId: string) =>
      stateRef.current.threads.filter((t) => t.planId === planId).reduce((m, t) => Math.max(m, t.number), 0) + 1;

    return {
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
      addThread: (t: Omit<Thread, 'id' | 'number'>) => {
        const thread: Thread = { ...t, id: newId('t'), number: nextNumber(t.planId) };
        dispatch({ type: 'addThread', thread });
        return thread;
      },
      reply: (threadId: string, author: string, role: Comment['role'], body: string) =>
        dispatch({ type: 'reply', threadId, comment: { id: newId('c'), author, role, body, at: 'now' } }),
      setThreadStatus: (threadId: string, status: Thread['status']) => dispatch({ type: 'updateThread', threadId, patch: { status } }),
      keepOnVersion: (threadId: string, version: number) => dispatch({ type: 'updateThread', threadId, patch: { onVersion: version } }),
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
      addLink: (link: Omit<ShareLink, 'id'>) => dispatch({ type: 'addLink', link: { ...link, id: newId('l') } }),
      revokeLink: (linkId: string) => dispatch({ type: 'revokeLink', linkId }),
      setBranding: (branding: Branding) => dispatch({ type: 'setBranding', branding }),
      setGuest: (name: string | null) => dispatch({ type: 'setGuest', name }),
    };
  }, [dispatch, findPost]);
}

type Actions = ReturnType<typeof useActions>;
const StoreContext = createContext<{ state: State; actions: Actions } | null>(null);

const BRANDING_KEY = 'gp-branding';
const GUEST_KEY = 'gp-guest';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const actions = useActions(state, dispatch);
  const loaded = useRef(false);

  // Per-browser settings only. Everything else resets on reload until there is a backend.
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BRANDING_KEY) || 'null');
      if (b && typeof b.hex === 'string') dispatch({ type: 'setBranding', branding: { ...DEFAULT_BRANDING, ...b } });
      const g = localStorage.getItem(GUEST_KEY);
      if (g) dispatch({ type: 'setGuest', name: g });
    } catch {
      /* storage unavailable: keep defaults */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(state.branding));
      if (state.guestName) localStorage.setItem(GUEST_KEY, state.guestName);
    } catch {
      /* ignore */
    }
  }, [state.branding, state.guestName]);

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

export function usePlanByToken(token: string) {
  const { state } = useStore();
  const link = state.links.find((l) => l.token === token && !l.revoked) ?? null;
  const plan = link ? state.plans.find((p) => p.id === link.planId) ?? null : null;
  const brand = plan ? state.brands.find((b) => b.id === plan.brandId) ?? null : null;
  return { link, plan, brand };
}
