'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Trash2, Check, Pencil, X, Camera, Download } from "lucide-react";
import { toast } from "sonner";
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
    const [exporting, setExporting] = useState(false);
    const [displayName, setDisplayName] = useState(userName ?? "");
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(userName ?? "");
    const [savingName, setSavingName] = useState(false);
    const [nameError, setNameError] = useState("");
    const [avatarSrc, setAvatarSrc] = useState(userImageSrc ?? "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError("");
        setUploadingAvatar(true);
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/user/avatar", { method: "POST", body: form });
        setUploadingAvatar(false);
        if (res.ok) {
            const { image } = await res.json();
            setAvatarSrc(image);
            router.refresh();
        } else {
            const { error } = await res.json().catch(() => ({ error: "Upload failed." }));
            setAvatarError(error ?? "Upload failed.");
        }
        // Reset so the same file can be re-selected if needed
        e.target.value = "";
    }

    async function handleSaveName() {
        if (!nameInput.trim()) {
            setNameError("Name cannot be empty.");
            return;
        }
        setSavingName(true);
        setNameError("");
        const res = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameInput.trim() }),
        });
        setSavingName(false);
        if (res.ok) {
            const { name } = await res.json();
            setDisplayName(name);
            setEditingName(false);
            router.refresh();
        } else {
            setNameError("Failed to save. Please try again.");
        }
    }

    function handleCancelEdit() {
        setNameInput(displayName);
        setNameError("");
        setEditingName(false);
    }

    async function handleExport() {
        setExporting(true);
        try {
            const res = await fetch("/api/user/export");
            if (!res.ok) {
                toast.error("Export failed", { description: "Something went wrong. Please try again." });
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "export.json";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Export ready", { description: "Your data has been downloaded." });
        } catch {
            toast.error("Export failed", { description: "Something went wrong. Please try again." });
        } finally {
            setExporting(false);
        }
    }

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
                        {/* Clickable avatar upload zone */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="relative shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                            aria-label="Change profile picture"
                        >
                            <Avatar size="lg">
                                {avatarSrc ? (
                                    <AvatarImage src={avatarSrc} alt={displayName || "User"} />
                                ) : null}
                                <AvatarFallback className="bg-slate-700 text-slate-200 text-lg">
                                    {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                                {uploadingAvatar
                                    ? <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    : <Camera className="size-4 text-white" />
                                }
                            </span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        {avatarError && (
                            <p className="text-xs text-red-400 -mt-2">{avatarError}</p>
                        )}
                        <div className="min-w-0 flex-1">
                            {editingName ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveName();
                                                if (e.key === "Escape") handleCancelEdit();
                                            }}
                                            className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="p-1.5 rounded-lg text-green-400 hover:bg-slate-700 disabled:opacity-50 transition"
                                            aria-label="Save name"
                                        >
                                            <Check className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition"
                                            aria-label="Cancel"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    {nameError && (
                                        <p className="text-xs text-red-400">{nameError}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-medium text-slate-100 truncate">
                                        {displayName || "No name set"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNameInput(displayName);
                                            setEditingName(true);
                                        }}
                                        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition"
                                        aria-label="Edit name"
                                    >
                                        <Pencil className="size-3.5" />
                                    </button>
                                </div>
                            )}
                            <p className="text-sm text-slate-400 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        {hasPassword
                            ? "Signed in with email and password."
                            : "Signed in with a social provider (GitHub or Google)."}
                    </p>
                </section>

                {/* Export data */}
                <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Data Export
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-100">Export your data</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Download all your chat history and document metadata as a JSON file.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-slate-600 text-slate-200 hover:bg-slate-700"
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <Download className="size-4 mr-1.5" />
                            {exporting ? "Exporting…" : "Export JSON"}
                        </Button>
                    </div>
                </section>

                {/* Danger zone */}
                <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400">
                        Danger Zone
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
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
