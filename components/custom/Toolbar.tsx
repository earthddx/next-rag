'use client';
import { signOut } from "next-auth/react";
import Image from "next/image";

export default ({ userName, userImageSrc }: { userName: string | null | undefined, userImageSrc: string | null | undefined }) => {


    return <div className="text-center mb-8 bg-amber-300">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        {userImageSrc && <Image
            className="dark:invert"
            src={userImageSrc}
            alt="Next.js logo"
            width={100}
            height={20}
            priority
        />}
        <h1 className="text-xl font-bold  mb-2">Welcome Back</h1>
        {userName && <h1 className="text-xl font-bold  mb-2">{userName}</h1>}
        <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center justify-center px-4 py-3 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition text-slate-300"
        >
            Sign Out
        </button>
    </div>
}