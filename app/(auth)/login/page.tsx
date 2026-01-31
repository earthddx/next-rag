'use client'

import Link from 'next/link';
import Credentials from '@/components/custom/Credentials';
import GoogleLoginButton from '@/components/custom/GoogleLoginButton';
import GithubLoginButton from '@/components/custom/GithubLoginButton';
import LogoBrand from '@/components/custom/LogoBrand';
import Divider from '@/components/custom/Divider';

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
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