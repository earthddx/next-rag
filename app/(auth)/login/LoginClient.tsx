"use client";

import React from 'react';
import Link from 'next/link';
import Credentials from '@/components/custom/login/Credentials';
import GoogleLoginButton from '@/components/custom/login/GoogleLoginButton';
import GithubLoginButton from '@/components/custom/login/GithubLoginButton';
import LogoBrand from '@/components/custom/LogoBrand';
import Divider from '@/components/custom/Divider';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginClient() {
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);


        try {
            const data = new FormData(e.currentTarget);
            const signInResponse = await signIn("credentials", {
                email: data.get("email"),
                password: data.get("password"),
                redirect: false,
            });

            if (signInResponse && !signInResponse.error) {
                //TODO: Redirect to homepage or dashboard; it is CHAT for now
                router.push("/chat");
            } else {
                console.log("Error: ", signInResponse);
                setError("Incorrect email or password. Please check your credentials and try again.");
                setLoading(false)
            }
        } catch (e) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
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
                        mode={"login"}
                        onSubmit={handleLogin}
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
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginClient