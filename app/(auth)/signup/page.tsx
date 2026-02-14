
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import SignupClient from '@/components/custom/SignupClient';

export default async function SignupPage() {
    const session = await getServerSession(authConfig);
    if (session) {
        return redirect("/chatroom");
    }
    return <SignupClient />
}