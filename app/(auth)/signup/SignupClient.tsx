'use client'
import React from 'react';
import Link from 'next/link';
import Credentials from '@/components/custom/login/Credentials';
import GoogleLoginButton from '@/components/custom/login/GoogleLoginButton';
import GithubLoginButton from '@/components/custom/login/GithubLoginButton';
import LogoBrand from '@/components/custom/LogoBrand';
import Divider from '@/components/custom/Divider';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function SignupClient() {

    const router = useRouter();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
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
                router.push("/chat");
                router.refresh();
            } else {
                console.log("Error: ", signInResponse);
                setError("Incorrect email or password. Please check your credentials and try again.");
                setLoading(false)
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="w-full max-w-md">
                <LogoBrand />
                {/* Login Form */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
                    <Credentials
                        error={error}
                        isLoading={loading}
                        mode={"signup"}
                        onSubmit={handleSignup}
                    />
                    <Divider />
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <GoogleLoginButton />
                        <GithubLoginButton />
                    </div>
                </div>
                {/* Sign Up Link */}
                <p className="text-center mt-6 text-slate-400">
                    Have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                        Go to Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignupClient