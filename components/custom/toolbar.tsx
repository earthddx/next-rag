'use client';
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Toolbar({ userName, userImageSrc }: { userName: string | null | undefined, userImageSrc: string | null | undefined }) {
    return (
        <header
            onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="flex sticky top-0 z-50 justify-between items-center p-2.5 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg rounded-b-lg max-w-3xl mx-auto">
            {/* Logo & App name */}
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <span className="block text-2xl font-extrabold text-slate-200">ChatDocs</span>
                    <span className="block text-sm text-slate-300">Welcome Back{userName ? `, ${userName}` : ""}!</span>
                </div>
            </div>
            {/* User profile & Sign Out */}
            <div className="flex items-center gap-4">
                {userImageSrc ? (
                    <Image
                        className="rounded-full border-2 border-slate-300 shadow-md"
                        src={userImageSrc}
                        alt={`${userName ?? "User"}'s avatar`}
                        width={42}
                        height={42}
                        priority
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xl text-slate-500 font-semibold">
                        {userName ? userName.charAt(0).toUpperCase() : <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth={2} /><path strokeWidth={2} d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" /></svg>}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => signOut()}
                    className="ml-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}