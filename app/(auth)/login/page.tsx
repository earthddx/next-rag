import Link from 'next/link';
import Credentials from '@/components/custom/login/Credentials';
import GoogleLoginButton from '@/components/custom/login/GoogleLoginButton';
import GithubLoginButton from '@/components/custom/login/GithubLoginButton';
import LogoBrand from '@/components/custom/LogoBrand';
import Divider from '@/components/custom/Divider';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export default async function LoginPage() {

  const session = await getServerSession(authConfig);
  if (session) {
    return redirect("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <LogoBrand />

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <Credentials />
          <Divider />
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <GoogleLoginButton />
            <GithubLoginButton />
          </div>
        </div>
        {/* Sign Up Link */}
        <p className="text-center mt-6 text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}