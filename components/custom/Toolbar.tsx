'use client';

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, FileText, Info, LogOut } from "lucide-react";
import LogoBrand from "@/components/custom/logo-brand";
import DocumentsDialog from "@/components/custom/DocumentsDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Toolbar({
    userName,
    userImageSrc,
    userEmail,
}: {
    userName: string | null | undefined;
    userImageSrc: string | null | undefined;
    userEmail: string | null | undefined;
}) {
    const router = useRouter();
    const [docsOpen, setDocsOpen] = useState(false);

    return (
        <>
            <header
                onClick={() => {
                    const conversation = document.getElementById("chat-conversation");
                    const scrollable = conversation?.firstElementChild as HTMLElement | null;
                    if (scrollable) {
                        scrollable.scrollTo({ top: 0, behavior: "smooth" });
                    }
                }}
                className="flex sticky top-0 z-50 justify-between items-center p-2.5 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg rounded-b-lg max-w-3xl mx-auto cursor-pointer"
            >
                {/* Logo & App name */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="hidden sm:block">
                        <LogoBrand size="md" />
                    </div>
                    <div className="block sm:hidden">
                        <LogoBrand size="sm" />
                    </div>
                    <span className="text-lg sm:text-2xl font-extrabold text-slate-200">ChatDocs</span>
                </div>

                {/* Hamburger Menu */}
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                aria-label="Open menu"
                            >
                                <Menu className="size-6" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-64 bg-slate-900 border-slate-700 text-slate-200"
                        >
                            {/* Profile header */}
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center gap-3 py-1">
                                    <Avatar size="lg">
                                        {userImageSrc ? (
                                            <AvatarImage src={userImageSrc} alt={userName ?? "User"} />
                                        ) : null}
                                        <AvatarFallback className="bg-slate-700 text-slate-200">
                                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate text-slate-100">
                                            {userName ?? "User"}
                                        </p>
                                        {userEmail && (
                                            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-slate-700" />

                            {/* My Documents */}
                            <DropdownMenuItem
                                className="cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-white"
                                onSelect={() => setDocsOpen(true)}
                            >
                                <FileText className="size-4" />
                                My Documents
                            </DropdownMenuItem>

                            {/* About */}
                            <DropdownMenuItem
                                className="cursor-pointer text-slate-200 focus:bg-slate-800 focus:text-white"
                                onSelect={() => router.push("/about")}
                            >
                                <Info className="size-4" />
                                About
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-700" />

                            {/* Sign Out */}
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer"
                                onSelect={() => signOut()}
                            >
                                <LogOut className="size-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <DocumentsDialog open={docsOpen} onOpenChange={setDocsOpen} />
        </>
    );
}
