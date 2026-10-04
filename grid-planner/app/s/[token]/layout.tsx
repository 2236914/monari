import type { Metadata } from 'next';
import { ClientShell } from '@/components/client/ClientShell';

// Share links are private: never indexed.
export const metadata: Metadata = {
  title: 'Review',
  robots: { index: false, follow: false },
};

export default async function ShareLayout({ children, params }: { children: React.ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientShell token={token}>{children}</ClientShell>;
}
