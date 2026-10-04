import { ClientPost } from '@/components/client/ClientPost';

export default async function SharePostPage({ params }: { params: Promise<{ token: string; postId: string }> }) {
  const { token, postId } = await params;
  return <ClientPost token={token} postId={postId} />;
}
