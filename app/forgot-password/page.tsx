"use client";

import Link from "next/link";
import { useState } from "react";
import LogoBrand from "@/components/custom/logo-brand";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call API route to send reset email
    setSubmitted(true);
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
        <div className="w-full rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-xl">
          {submitted ? (
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
              <p className="text-sm text-slate-400">
                If an account exists for that email, we've sent a password reset link.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm text-blue-400 transition hover:text-blue-300"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white">Forgot password</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john.doe@example.com"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50"
                >
                  Send reset link
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-blue-400 transition hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
