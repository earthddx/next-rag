import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import LoginClient from '@/components/custom/LoginClient';

export default async function LoginPage() {
  const session = await getServerSession(authConfig);
  if (session) {
    return redirect("/chatroom");
  }
  return <LoginClient />
}