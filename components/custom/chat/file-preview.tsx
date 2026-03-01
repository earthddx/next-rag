"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreviewFile } from "./types";
import { WORD_MIME_TYPES } from "@/lib/file-types";

export default ({ previewFile, setPreviewFile }: {
    previewFile: PreviewFile | null;
    setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFile | null>>;
}) => {
    const iframeSrc = previewFile
        ? WORD_MIME_TYPES.includes(previewFile.fileType ?? "")
            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`
            : previewFile.url
        : "";

    return <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-3xl md:max-w-5xl  flex flex-col h-[90vh]">
            <DialogHeader>
                <DialogTitle>{previewFile?.fileName || "File Preview"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
                {previewFile && (
                    <iframe
                        src={iframeSrc}
                        className="w-full h-full border-0 rounded"
                        title={previewFile.fileName}
                    />
                )}
            </div>
        </DialogContent>
    </Dialog>
}