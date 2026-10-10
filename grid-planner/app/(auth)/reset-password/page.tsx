import { AuthShell } from '@/components/auth/AuthShell';
import { ResetForm } from './ResetForm';

export const metadata = { title: 'Set a new password' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <AuthShell headline="A new password, then back to work." body="Setting a new password signs you out on your other devices.">
      <ResetForm expired={expired === '1'} />
    </AuthShell>
  );
}
