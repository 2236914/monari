import { ClientProfile } from '@/components/client/ClientProfile';

export default async function ShareProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientProfile token={token} />;
}
