"use client";

import React from 'react';
import Link from 'next/link';

interface CredentialsFormProps {
    mode: "login" | "signup";
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
    error: string;
}

export default (props: CredentialsFormProps) => {
    const { mode, onSubmit, isLoading, error } = props;
    const isLogin = mode === "login";

    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="••••••••"
                    />
                </div>

                {/* Confirm Password (Signup Only) */}
                {!isLogin && (
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="••••••••"
                        />
                    </div>
                )}

                {/* Remember Me / Forgot Password (Login Only) */}
                {isLogin && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 bg-slate-900 border-slate-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                                Remember me
                            </label>
                        </div>
                        <Link 
                            href="/forgot-password"
                            className={`text-sm transition ${
                                isLoading 
                                    ? "pointer-events-none opacity-50 text-slate-500" 
                                    : "text-blue-400 hover:text-blue-300"
                            }`}
                        >
                            Forgot password?
                        </Link>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isLogin ? 'Signing in...' : 'Creating account...'}
                        </>
                    ) : (
                        isLogin ? 'Sign In' : 'Sign Up'
                    )}
                </button>
            </div>
        </form>
    );
}