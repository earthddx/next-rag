'use client'
import React from 'react';
import Link from 'next/link';
import Credentials from '@/components/custom/login/credentials';
import GoogleLoginButton from '@/components/custom/login/google-login-button';
import GithubLoginButton from '@/components/custom/login/github-login-button';
import Divider from '@/components/custom/divider';
import LogoBrand from '@/components/custom/logo-brand';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

function SignupClient() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData(e.currentTarget);
            // Create account
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
            });

            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.error || 'Something went wrong');
            }

            // Auto sign in after successful signup
            const signInResponse = await signIn('credentials', {
                email: data.get("email"),
                password: data.get("password"),
                redirect: false,
            });

            if (signInResponse && !signInResponse.error) {
                //TODO: Redirect to homepage or dashboard; it is CHAT for now
                router.push("/chatroom");
                router.refresh();
            } else {
                toast.error("Sign in after signup failed. Please try logging in.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-blue-400 transition hover:text-blue-300"
                >
                    <LogoBrand size="sm" />
                    ChatDocs
                </Link>
            </nav>
            <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md flex-col items-center justify-center">
                {/* Signup Form */}
                <div className="w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Create an account</h1>
                        <p className="mt-1 text-sm text-slate-400">Get started with ChatDocs for free</p>
                    </div>
                    <Credentials
                        isLoading={loading}
                        mode={"signup"}
                        onSubmit={handleSignup}
                    />
                    <Divider />
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <GoogleLoginButton isLoading={loading} onLoadingChange={setLoading} />
                        <GithubLoginButton isLoading={loading} onLoadingChange={setLoading} />
                    </div>
                </div>
                {/* Log In Link */}
                <p className="text-center mt-6 text-slate-400">
                    Have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignupClient
