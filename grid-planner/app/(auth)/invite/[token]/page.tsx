import { AuthShell } from '@/components/auth/AuthShell';
import { InviteForm } from './InviteForm';

export const metadata = { title: 'Join Morpho' };

export default async function InvitePage({ searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  const aside = (
    <div className="row" aria-hidden="true">
      <span className="avatar" style={{ width: 48, height: 48, background: 'var(--on-inverse)', color: 'var(--inverse)', border: '2px solid var(--inverse)', fontSize: 18 }}>S</span>
      <span className="avatar" style={{ width: 48, height: 48, marginLeft: -12, background: 'var(--block)', color: 'var(--on-block)', border: '2px solid var(--inverse)', fontSize: 18 }}>M</span>
      <span className="avatar t-meta" style={{ width: 48, height: 48, marginLeft: -12, background: 'var(--inverse)', color: 'var(--on-inverse)', border: '2px solid var(--on-inverse)' }}>+1</span>
    </div>
  );
  return (
    <AuthShell
      aside={aside}
      headline="Morpho plans 6 brands here."
      body="As a Member you can upload posts, write captions, reply to clients and talk with the team in internal threads."
    >
      <InviteForm expired={expired === '1'} />
    </AuthShell>
  );
}
