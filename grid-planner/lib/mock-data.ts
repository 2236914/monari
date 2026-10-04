import type { Brand, Plan, Post, ShareLink, Status, Thread } from './types';

const art = (n: number) => ({ kind: 'art' as const, art: n });

function post(id: string, type: Post['type'], arts: number[], status: Status, version: number, caption: string, reelLength?: string): Post {
  return { id, type, slides: arts.map(art), coverIndex: 0, caption, status, version, reelLength };
}

export const WORKSPACE = { name: 'Morpho', plan: 'Studio', brandLimit: 20 };

export const MEMBERS = [
  { name: 'Sean', email: 'sean@morpho.studio', role: 'Owner' },
  { name: 'Maya', email: 'maya@morpho.studio', role: 'Member' },
  { name: 'Mateo', email: 'mateo@morpho.studio', role: 'Member' },
];

export const CURRENT_USER = MEMBERS[0];

export const BRANDS: Brand[] = [
  {
    id: 'halden', name: 'Halden Coffee', username: 'haldencoffee', displayName: 'Halden Coffee', category: 'Coffee shop',
    bio: 'Small-batch roastery and bakery. Opening this October.', link: 'haldencoffee.com', followers: '2,480', following: '312',
    avatarBg: '#1B2A4A', avatarFg: '#F3D36B', initial: 'h', swatches: ['#E2492F', '#F3D36B', '#A8C8E8', '#F08A3C', '#1E4D3A', '#5B2A4E'],
  },
  {
    id: 'nori', name: 'Nori Ramen', username: 'noriramen.co', displayName: 'Nori Ramen', category: 'Restaurant',
    bio: 'Tonkotsu, shoyu and nothing else.', link: 'noriramen.co', followers: '5,210', following: '140',
    avatarBg: '#B3261E', avatarFg: '#FFF4E0', initial: 'N', swatches: ['#B3261E', '#FFF4E0', '#2B2B2B', '#F2B33D', '#6B8F71', '#B3261E'],
  },
  {
    id: 'vale', name: 'Atelier Vale', username: 'ateliervale', displayName: 'Atelier Vale', category: 'Clothing',
    bio: 'Slow fashion, made in small runs.', link: 'ateliervale.com', followers: '12.4K', following: '520',
    avatarBg: '#D8CFC4', avatarFg: '#3D3A35', initial: 'A', swatches: ['#D8CFC4', '#3D3A35', '#A69886', '#EDE7DF', '#7A6F62', '#D8CFC4'],
  },
  {
    id: 'pila', name: 'Pila Yoga', username: 'pilayoga', displayName: 'Pila Yoga', category: 'Yoga studio',
    bio: 'Classes for every body.', link: 'pilayoga.com', followers: '3,090', following: '410',
    avatarBg: '#2F5D50', avatarFg: '#F4E9D8', initial: 'P', swatches: ['#F4E9D8', '#2F5D50', '#E8A87C', '#C38D9E', '#2F5D50', '#F4E9D8'],
  },
  {
    id: 'ortiz', name: 'Studio Ortiz', username: 'studio.ortiz', displayName: 'Studio Ortiz', category: 'Architecture',
    bio: 'Homes and small public buildings.', link: 'studio-ortiz.com', followers: '8,750', following: '230',
    avatarBg: '#111111', avatarFg: '#E6E1D3', initial: 'O', swatches: ['#E6E1D3', '#111111', '#C2B8A3', '#5A5A5A', '#E6E1D3', '#8C7B6B'],
  },
  {
    id: 'kettle', name: 'Kettle & Crumb', username: 'kettleandcrumb', displayName: 'Kettle & Crumb', category: 'Bakery',
    bio: 'Bread before sunrise.', link: 'kettleandcrumb.com', followers: '1,960', following: '288',
    avatarBg: '#F2C14E', avatarFg: '#4A2C1D', initial: 'K', swatches: ['#F2C14E', '#4A2C1D', '#F78154', '#FFF1D0', '#4D9078', '#F2C14E'],
  },
];

const OCTOBER: Post[] = [
  post('new-season', 'post', [1], 'review', 1, 'New season, new menu. Our autumn lineup lands on 12 October. See you at the bar.'),
  post('hiring', 'post', [11], 'draft', 1, "We're hiring baristas for the new season. Apply through the link in bio."),
  post('fall-menu', 'carousel', [12, 2, 5, 7], 'review', 2, "The fall menu is here. Swipe for the four drinks we can't stop making."),
  post('behind-the-bar', 'reel', [7], 'changes', 2, 'Behind the bar with Mateo: how we pull the golden hour blend.', '0:24'),
  post('single-origin', 'carousel', [3, 13, 14, 15, 16, 9], 'changes', 3, 'Single origin from Huila, Colombia. Washed, bright and our favourite filter this month. Swipe for tasting notes and a brew guide.'),
  post('golden-hour', 'post', [5], 'approved', 2, 'Golden hour blend. Caramel, orange peel and a long, sweet finish.'),
  post('croissant-fridays', 'post', [10], 'approved', 1, "Croissant Fridays are back. Every Friday from 7am, until they're gone."),
  post('oat-flat-white', 'post', [2], 'review', 1, 'Oat flat white, the one you keep ordering.'),
  post('opening-day', 'post', [4], 'scheduled', 1, 'Opening day is 12 October. Doors open at 7am.'),
  post('slow-mornings', 'post', [6], 'approved', 1, 'Slow mornings, done right.'),
  post('roasted', 'carousel', [8, 3, 9], 'approved', 1, 'Roasted in-house, in small batches, every week.'),
  post('hello', 'post', [9], 'scheduled', 1, 'Hello from Halden. Coffee and bakery, opening this October.'),
];

function filler(prefix: string, statuses: Status[], arts: number[]): Post[] {
  return statuses.map((s, i) => post(`${prefix}-${i + 1}`, 'post', [arts[i % arts.length]], s, 1, ''));
}

export const PLANS: Plan[] = [
  { id: 'october-launch', brandId: 'halden', name: 'October launch', ratio: '3:4', updated: '2h ago', posts: OCTOBER },
  { id: 'holiday-gift-guide', brandId: 'halden', name: 'Holiday gift guide', ratio: '3:4', updated: 'today', posts: [] },
  { id: 'winter-menu', brandId: 'nori', name: 'Winter menu', ratio: '3:4', updated: '3d ago', posts: filler('winter', ['review', 'review', 'review', 'review', 'approved', 'approved', 'approved', 'draft', 'draft'], [12, 2, 5]) },
  { id: 'spring-drop', brandId: 'vale', name: 'Spring drop', ratio: '4:5', updated: 'yesterday', posts: filler('spring', Array(9).fill('draft'), [6, 14, 9]) },
  { id: 'november-classes', brandId: 'pila', name: 'November classes', ratio: '3:4', updated: '5h ago', posts: filler('nov', Array(6).fill('approved'), [8, 4, 6]) },
  { id: 'portfolio-refresh', brandId: 'ortiz', name: 'Portfolio refresh', ratio: '1:1', updated: '1w ago', posts: filler('portfolio', Array(12).fill('scheduled'), [9, 14, 3]) },
  { id: 'bakery-launch', brandId: 'kettle', name: 'Bakery launch', ratio: '3:4', updated: '4d ago', posts: filler('bakery', ['changes', 'review', 'review', 'review', 'review', 'review', 'review', 'review', 'review'], [10, 1, 11]) },
];

export const THREADS: Thread[] = [
  {
    id: 't1', planId: 'october-launch', postId: 'single-origin', number: 1, slideIndex: 1, x: 0.55, y: 0.38,
    visibility: 'client', status: 'open', onVersion: 3,
    comments: [
      { id: 'c1', author: 'Lina', role: 'client', body: "Could “Cocoa nib” say “dark chocolate”? Customers won't know what nib means.", at: '2h' },
      { id: 'c2', author: 'Sean', role: 'team', body: 'Good call. Swapping it in the next version.', at: '1h' },
    ],
  },
  {
    id: 't2', planId: 'october-launch', postId: 'single-origin', number: 2, slideIndex: 1, x: 0.12, y: 0.88,
    visibility: 'internal', status: 'open', onVersion: 3,
    comments: [{ id: 'c3', author: 'Maya', role: 'team', body: "@Sean the logo on this slide is the low-res file. I'll swap in the vector before we resend.", at: '40m' }],
  },
  {
    id: 't3', planId: 'october-launch', postId: 'single-origin', number: 3, slideIndex: 3, x: 0.4, y: 0.3,
    visibility: 'client', status: 'open', onVersion: 2,
    comments: [{ id: 'c4', author: 'Lina', role: 'client', body: 'The yellow feels too loud next to the green post before it.', at: '1d' }],
  },
  {
    id: 't4', planId: 'october-launch', postId: 'oat-flat-white', number: 4, slideIndex: null, x: null, y: null,
    visibility: 'internal', status: 'open', onVersion: 1,
    comments: [{ id: 'c5', author: 'Maya', role: 'team', body: "Cup colour is off against the brand green. I'll reshoot on Thursday.", at: '1d' }],
  },
  {
    id: 't5', planId: 'october-launch', postId: 'behind-the-bar', number: 5, slideIndex: null, x: null, y: null,
    visibility: 'client', status: 'open', onVersion: 2,
    comments: [{ id: 'c6', author: 'Lina', role: 'client', body: 'The first two seconds feel slow. Can it start on the pour?', at: '5h' }],
  },
  {
    id: 't6', planId: 'october-launch', postId: 'fall-menu', number: 6, slideIndex: 2, x: 0.5, y: 0.6,
    visibility: 'client', status: 'open', onVersion: 2,
    comments: [{ id: 'c7', author: 'Lina', role: 'client', body: 'Love this one. Can the third drink be the pumpkin latte instead?', at: '3h' }],
  },
  {
    id: 't7', planId: 'october-launch', postId: 'single-origin', number: 7, slideIndex: 0, x: 0.3, y: 0.2,
    visibility: 'client', status: 'resolved', onVersion: 2,
    comments: [{ id: 'c8', author: 'Lina', role: 'client', body: 'Can “Single origin” be a bit bigger?', at: '2d' }],
  },
];

export const SHARE_LINKS: ShareLink[] = [
  { id: 'l1', planId: 'october-launch', token: 'k7Qm2xV9pLr4', mode: 'approve', allowComments: true, password: false, expires: '31 Oct', views: 14, created: '1 Oct', revoked: null },
  { id: 'l2', planId: 'october-launch', token: 'old9Fh2kQz', mode: 'view', allowComments: false, password: false, expires: null, views: 3, created: '26 Sep', revoked: '28 Sep' },
];

/** Dashboard-only sample figures. Replace with real queries once there is a backend. */
export const DASHBOARD = {
  ranges: {
    '7d': {
      unit: 'day', unitTitle: 'Day', text: 'last 7 days', approved: 9, delta: '3 more than the 7 days before', tta: '1.4 days',
      labels: ['Sun 27', 'Mon 28', 'Tue 29', 'Wed 30', 'Thu 1', 'Fri 2', 'Sat 3'],
      full: ['Sun 27 Sep', 'Mon 28 Sep', 'Tue 29 Sep', 'Wed 30 Sep', 'Thu 1 Oct', 'Fri 2 Oct', 'Sat 3 Oct'],
      values: [0, 2, 1, 3, 0, 2, 1],
    },
    '30d': {
      unit: 'week', unitTitle: 'Week of', text: 'last 30 days', approved: 24, delta: '6 more than the 30 days before', tta: '1.6 days',
      labels: ['7 Sep', '14 Sep', '21 Sep', '28 Sep'],
      full: ['Week of 7 Sep', 'Week of 14 Sep', 'Week of 21 Sep', 'Week of 28 Sep'],
      values: [4, 6, 5, 9],
    },
    '90d': {
      unit: 'week', unitTitle: 'Week of', text: 'last 90 days', approved: 61, delta: '19 more than the 90 days before', tta: '2.1 days',
      labels: ['6 Jul', '13 Jul', '20 Jul', '27 Jul', '3 Aug', '10 Aug', '17 Aug', '24 Aug', '31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep'],
      full: ['Week of 6 Jul', 'Week of 13 Jul', 'Week of 20 Jul', 'Week of 27 Jul', 'Week of 3 Aug', 'Week of 10 Aug', 'Week of 17 Aug', 'Week of 24 Aug', 'Week of 31 Aug', 'Week of 7 Sep', 'Week of 14 Sep', 'Week of 21 Sep', 'Week of 28 Sep'],
      values: [2, 3, 1, 4, 5, 3, 6, 4, 5, 4, 6, 5, 9],
    },
  },
  links: [
    { plan: 'October launch', meta: 'Halden Coffee · 14 views · 2h ago', acted: true },
    { plan: 'Winter menu', meta: 'Nori Ramen · 6 views · 3d ago', acted: true },
    { plan: 'November classes', meta: 'Pila Yoga · 9 views · yesterday', acted: true },
    { plan: 'Bakery launch', meta: 'Kettle & Crumb · 4 views · 4d ago', acted: true },
    { plan: 'Holiday gift guide preview', meta: 'Halden Coffee · 1 view · today', acted: false },
  ],
  week: [
    { name: 'Sun', date: '4 Oct', posts: [] as { art: number; label: string }[] },
    { name: 'Mon', date: '5 Oct', posts: [{ art: 9, label: '@haldencoffee 9:00' }] },
    { name: 'Tue', date: '6 Oct', posts: [{ art: 8, label: '@haldencoffee 12:30' }] },
    { name: 'Wed', date: '7 Oct', posts: [] },
    { name: 'Thu', date: '8 Oct', posts: [{ art: 6, label: '@haldencoffee 8:00' }, { art: 4, label: '@haldencoffee 18:00' }] },
    { name: 'Fri', date: '9 Oct', posts: [{ art: 10, label: '@haldencoffee 7:00' }] },
    { name: 'Sat', date: '10 Oct', posts: [{ art: 5, label: '@haldencoffee 10:00' }, { art: 1, label: '@haldencoffee 16:00' }] },
  ],
  activity: [
    { initial: 'L', who: 'Lina', role: 'client', what: 'approved Post 6 in October launch', meta: 'Halden Coffee · 4m ago', href: '/plans/october-launch' },
    { initial: 'L', who: 'Lina', role: 'client', what: 'requested changes on Post 8', meta: 'Halden Coffee · 2h ago', href: '/plans/october-launch/posts/single-origin' },
    { initial: 'M', who: 'Maya', role: 'team', what: 'left an internal note on Post 8', meta: 'Halden Coffee · 40m ago', href: '/plans/october-launch/posts/single-origin' },
    { initial: 'K', who: 'Kenji', role: 'client', what: 'opened the Winter menu link', meta: 'Nori Ramen · 3h ago', href: '/brands' },
    { initial: 'A', who: 'Ana', role: 'client', what: 'approved all 6 posts in November classes', meta: 'Pila Yoga · yesterday', href: '/brands' },
    { initial: 'S', who: 'Sean', role: 'team', what: 'shared Bakery launch for review', meta: 'Kettle & Crumb · 4d ago', href: '/brands' },
  ],
};
