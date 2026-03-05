'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default ({ userName, userEmail, userImageSrc, hasPassword }:
    {
        userName: string | null | undefined,
        userEmail: string | null | undefined,
        userImageSrc: string | null | undefined,
        hasPassword: boolean
    }) => {
    const [displayName, setDisplayName] = React.useState<string>(userName ?? "");

    return <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Profile
        </h2>
        <div className="flex items-center gap-4">
            <AvatarComponent userImageSrc={userImageSrc} displayName={displayName} />
            <div className="min-w-0 flex-1">
                <NameComponent userName={userName} displayName={displayName} setDisplayName={setDisplayName} />
                <p className="text-sm text-slate-400 truncate">{userEmail}</p>
            </div>
        </div>
        <p className="text-xs text-slate-500">
            {hasPassword
                ? "Signed in with email and password."
                : "Signed in with a social provider (GitHub or Google)."}
        </p>
    </section>
}

const NameComponent = ({ userName, displayName, setDisplayName }:
    {
        userName: string | null | undefined;
        displayName: string;
        setDisplayName: React.Dispatch<React.SetStateAction<string>>
    }) => {
    const [editingName, setEditingName] = React.useState(false);
    const [nameInput, setNameInput] = React.useState(userName ?? "");
    const [savingName, setSavingName] = React.useState<boolean>(false);
    const [nameError, setNameError] = React.useState("");

    const router = useRouter();

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

    if (editingName) {
        return <div className="space-y-1">
            <div className="flex items-center gap-2 min-w-0">
                <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="shrink-0 p-1.5 rounded-lg text-green-400 hover:bg-slate-700 disabled:opacity-50 transition"
                    aria-label="Save name"
                >
                    <Check className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition"
                    aria-label="Cancel"
                >
                    <X className="size-4" />
                </button>
            </div>
            {nameError && (
                <p className="text-xs text-red-400">{nameError}</p>
            )}
        </div>
    }

    return <div className="flex items-center gap-2">
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

}

const AvatarComponent = ({ userImageSrc, displayName }:
    {
        userImageSrc: string | null | undefined;
        displayName: string
    }) => {
    const [avatarSrc, setAvatarSrc] = React.useState(userImageSrc ?? "");
    const [uploadingAvatar, setUploadingAvatar] = React.useState<boolean>(false);
    const [avatarError, setAvatarError] = React.useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const router = useRouter();

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

    return <>
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
    </>
}