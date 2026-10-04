import { ClientDone } from '@/components/client/ClientDone';

export default async function ShareDonePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientDone token={token} />;
}
