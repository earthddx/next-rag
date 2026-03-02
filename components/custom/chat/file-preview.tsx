"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreviewFile } from "./types";
import { needsOfficeViewer, TEXT_PREVIEW_EXTENSIONS } from "@/lib/file-types";
import { TextPreview, getExt } from "@/components/custom/text-preview";

export default ({ previewFile, setPreviewFile }: {
    previewFile: PreviewFile | null;
    setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFile | null>>;
}) => {
    const ext = previewFile ? getExt(previewFile.fileName) : "";
    const isText = TEXT_PREVIEW_EXTENSIONS.has(ext);
    const iframeSrc = !isText && previewFile
        ? needsOfficeViewer(previewFile.fileName, previewFile.fileType)
            ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`
            : previewFile.url
        : "";

    return <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-3xl md:max-w-5xl flex flex-col h-[90vh]">
            <DialogHeader>
                <DialogTitle>{previewFile?.fileName || "File Preview"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-hidden">
                {previewFile && (
                    isText
                        ? <TextPreview url={previewFile.url} />
                        : <iframe
                            src={iframeSrc}
                            className="w-full h-full border-0 rounded"
                            title={previewFile.fileName}
                        />
                )}
            </div>
        </DialogContent>
    </Dialog>;
}
