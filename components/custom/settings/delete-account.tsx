'use client';

import React from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export default ({ deleteOpen, setDeleteOpen }:
    {
        deleteOpen: boolean,
        setDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>
    }) => {
    const [deleting, setDeleting] = React.useState<boolean>(false);

    async function handleDeleteAccount() {
        setDeleting(true);
        await fetch("/api/user/account", { method: "DELETE" });
        localStorage.removeItem("currentSessionId");
        signOut({ callbackUrl: "/" });
    }

    return <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
            <DialogFooter className="gap-3">
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
}