'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoBrand from "@/components/custom/logo-brand";

export default () => {
    const router = useRouter();

    return <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
            href="/chatroom"
            className="flex items-center gap-2 text-lg font-semibold text-blue-400 transition hover:text-blue-300"
        >
            <LogoBrand size="sm" />
            ChatDocs
        </Link>
        <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-200"
        >
            <ArrowLeft className="size-4" />
            Back
        </button>
    </nav>
}