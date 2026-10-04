import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import { THEME_SCRIPT, ThemeProvider } from '@/lib/theme';
import './globals.css';

const sans = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });
// Only for the sample post artwork and brand avatars, never for interface text.
const brand = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-brand' });

export const metadata: Metadata = {
  title: { default: 'Grid Planner', template: '%s · Grid Planner' },
  description: 'Plan an Instagram grid, show it to your client exactly as it will look, and get it approved in one link.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${brand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <StoreProvider>{children}</StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
