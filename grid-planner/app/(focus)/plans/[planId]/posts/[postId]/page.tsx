import { PostViewer } from './PostViewer';

export default async function PostViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string; postId: string }>;
  searchParams: Promise<{ slide?: string; thread?: string }>;
}) {
  const { planId, postId } = await params;
  const { slide, thread } = await searchParams;
  return <PostViewer planId={planId} postId={postId} initialSlide={slide ? Number(slide) : undefined} initialThread={thread} />;
}
