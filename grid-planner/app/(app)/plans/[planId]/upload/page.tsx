import { Uploader } from './Uploader';

export default async function UploadPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <Uploader planId={planId} />;
}
