
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import SignupClient from './SignupClient';

export default async function SignupPage() {
    const session = await getServerSession(authConfig);
    if (session) {
        return redirect("/chat");
    }
    return <SignupClient />
}