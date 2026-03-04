'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import LogoBrand from "@/components/custom/logo-brand";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsClient({
    userName,
    userEmail,
    userImageSrc,
    hasPassword,
}: {
    userName: string | null | undefined;
    userEmail: string | null | undefined;
    userImageSrc: string | null | undefined;
    hasPassword: boolean;
}) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDeleteAccount() {
        setDeleting(true);
        await fetch("/api/user/account", { method: "DELETE" });
        localStorage.removeItem("currentSessionId");
        signOut({ callbackUrl: "/" });
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Nav */}
            <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
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

            <main className="mx-auto max-w-2xl px-6 py-8 space-y-8">
                <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>

                {/* Profile section */}
                <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Profile
                    </h2>
                    <div className="flex items-center gap-4">
                        <Avatar size="lg">
                            {userImageSrc ? (
                                <AvatarImage src={userImageSrc} alt={userName ?? "User"} />
                            ) : null}
                            <AvatarFallback className="bg-slate-700 text-slate-200 text-lg">
                                {userName ? userName.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-base font-medium text-slate-100 truncate">
                                {userName ?? "No name set"}
                            </p>
                            <p className="text-sm text-slate-400 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        {hasPassword
                            ? "Signed in with email and password."
                            : "Signed in with a social provider (GitHub or Google)."}
                    </p>
                </section>

                {/* Danger zone */}
                <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                        Danger Zone
                    </h2>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-100">Delete account</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Permanently remove your account, all documents, and chat history.
                                This cannot be undone.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="size-4 mr-1.5" />
                            Delete account
                        </Button>
                    </div>
                </section>
            </main>

            {/* Delete account confirmation dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-100">Delete Account</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-3 text-slate-400">
                                <p>
                                    This will permanently delete your account and all associated data:
                                </p>
                                <ul className="space-y-1 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
                                        All uploaded documents and their chunks
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
                                        All chat sessions and message history
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
                                        Your account credentials
                                    </li>
                                </ul>
                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="border-slate-600 text-slate-700 hover:bg-slate-800"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                        >
                            <Trash2 className="size-4 mr-2" />
                            {deleting ? "Deleting…" : "Delete account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
