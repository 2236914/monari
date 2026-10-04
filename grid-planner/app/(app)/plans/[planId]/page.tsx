import { Planner } from './Planner';

export default async function PlanPage({ params, searchParams }: { params: Promise<{ planId: string }>; searchParams: Promise<{ share?: string }> }) {
  const { planId } = await params;
  const { share } = await searchParams;
  return <Planner planId={planId} openShare={share === '1'} />;
}
