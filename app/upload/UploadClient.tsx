"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { processPdfFile } from "./actions";
import {
    Attachments,
    Attachment,
    AttachmentPreview,
    AttachmentInfo,
    AttachmentRemove,
} from "@/components/ai-elements/attachments";
import { Loader } from "@/components/ai-elements/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon, UploadIcon } from "lucide-react";
import type { AttachmentData } from "@/components/ai-elements/attachments";

const ACCEPT = "application/pdf";
const INPUT_NAME = "pdf";

export default function PDFUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [attachmentData, setAttachmentData] = useState<AttachmentData | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const clearFile = useCallback(() => {
        if (attachmentData?.type === "file" && attachmentData.url) {
            URL.revokeObjectURL(attachmentData.url);
        }
        setFile(null);
        setAttachmentData(null);
        setStatus("idle");
        setMessage("");
    }, [attachmentData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected || selected.type !== "application/pdf") return;
        if (attachmentData?.type === "file" && attachmentData.url) {
            URL.revokeObjectURL(attachmentData.url);
        }
        const url = URL.createObjectURL(selected);
        setFile(selected);
        setAttachmentData({
            type: "file",
            id: crypto.randomUUID(),
            url,
            filename: selected.name,
            mediaType: selected.type,
        });
        setStatus("idle");
        setMessage("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a PDF file.");
            setStatus("error");
            return;
        }
        setStatus("loading");
        setMessage("");
        const formData = new FormData();
        formData.set(INPUT_NAME, file);
        const result = await processPdfFile(formData);
        if (result.success) {
            setMessage(`Uploaded and processed successfully. ${result.chunksCreated} chunks created.`);
            setStatus("success");
            setFile(null);
            setAttachmentData(null);
            if (attachmentData?.type === "file" && attachmentData.url) {
                URL.revokeObjectURL(attachmentData.url);
            }
        } else {
            setMessage(result.error ?? "Failed to process PDF.");
            setStatus("error");
        }
    };

    return (
        <div className="flex flex-col min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileTextIcon className="size-5" />
                        PDF Upload
                    </CardTitle>
                    <CardDescription>
                        Upload a PDF to process and add to your knowledge base for RAG.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPT}
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="Select PDF file"
                        />
                        {attachmentData ? (
                            <Attachments variant="list">
                                <Attachment data={attachmentData} onRemove={clearFile}>
                                    <AttachmentPreview fallbackIcon={<FileTextIcon className="size-4 text-muted-foreground" />} />
                                    <AttachmentInfo />
                                    <AttachmentRemove label="Remove file" />
                                </Attachment>
                            </Attachments>
                        ) : (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-10 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
                            >
                                <UploadIcon className="size-10 text-muted-foreground" />
                                <span className="text-muted-foreground text-sm">Click to select a PDF</span>
                            </button>
                        )}
                        {message && (
                            <p
                                className={`text-sm ${status === "error" ? "text-destructive" : status === "success" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                            >
                                {message}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button type="submit" disabled={!file || status === "loading"} className="flex-1">
                                {status === "loading" ? (
                                    <>
                                        <Loader size={16} />
                                        Processing…
                                    </>
                                ) : (
                                    "Upload & Process"
                                )}
                            </Button>
                            {file && (
                                <Button type="button" variant="outline" onClick={clearFile} disabled={status === "loading"}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/chat">Back to chat</Link>
                </Button>
            </div>
        </div>
    );
}


