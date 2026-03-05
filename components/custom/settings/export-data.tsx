'use client';

import React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default () => {
    const [exporting, setExporting] = React.useState<boolean>(false);

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

    return <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 space-y-4">
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
}