'use client';
import { signOut } from "next-auth/react";
import Image from "next/image";
import LogoBrand from "@/components/custom/logo-brand";

export default function Toolbar({ userName, userImageSrc }: { userName: string | null | undefined, userImageSrc: string | null | undefined }) {
    return (
        <header
            onClick={() => {
                const conversation = document.getElementById("chat-conversation");
                const scrollable = conversation?.firstElementChild as HTMLElement | null;
                if (scrollable) {
                    scrollable.scrollTo({ top: 0, behavior: "smooth" });
                }
            }}
            className="flex sticky top-0 z-50 justify-between items-center p-2.5 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg rounded-b-lg max-w-3xl mx-auto cursor-pointer">
            {/* Logo & App name */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="hidden sm:block">
                    <LogoBrand size="md" />
                </div>
                <div className="block sm:hidden">
                    <LogoBrand size="sm" />
                </div>
                <div className="min-w-0">
                    <span className="block text-lg sm:text-2xl font-extrabold text-slate-200">ChatDocs</span>
                    <span className="block text-xs sm:text-sm text-slate-300 truncate">Welcome Back{userName ? `, ${userName}` : ""}!</span>
                </div>
            </div>
            {/* User profile & Sign Out */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {userImageSrc ? (
                    <Image
                        className="rounded-full border-2 border-slate-300 shadow-md"
                        src={userImageSrc}
                        alt={`${userName ?? "User"}'s avatar`}
                        width={36}
                        height={36}
                        priority
                    />
                ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center text-base sm:text-xl text-slate-500 font-semibold">
                        {userName ? userName.charAt(0).toUpperCase() : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth={2} /><path strokeWidth={2} d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" /></svg>}
                    </div>
                )}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); signOut(); }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-600 text-sm sm:text-base text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition whitespace-nowrap"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}