'use client';

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default ({ setDeleteOpen }: { setDeleteOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 space-y-4">
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
}