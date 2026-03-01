'use client';

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2, Eye, ArrowLeft } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  status: string;
  uploadedAt: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Document | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [previewTarget, setPreviewTarget] = React.useState<Document | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents ?? []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // Preview dialog
  if (previewTarget) {
    return (
      <Dialog open onOpenChange={() => setPreviewTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition"
                aria-label="Back to documents"
              >
                <ArrowLeft className="size-4" />
              </button>
              <DialogTitle className="text-slate-100 truncate">
                {previewTarget.fileName}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 mx-6 mb-6 rounded-lg overflow-hidden border border-slate-700 bg-white">
            <iframe
              src={
                ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"].includes(previewTarget.fileType)
                  ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewTarget.filePath)}`
                  : previewTarget.filePath
              }
              className="w-full h-full"
              title={`Preview of ${previewTarget.fileName}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Delete confirmation dialog
  if (deleteTarget) {
    return (
      <Dialog open onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Delete Document</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-200">{deleteTarget.fileName}</span>?
              This will permanently remove the file and all its processed chunks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-700 hover:bg-slate-800"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-slate-100">My Documents</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="size-10 mb-3" />
              <p className="text-sm">No documents uploaded yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5"
                >
                  <FileText className="size-5 shrink-0 text-blue-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(doc.fileSize)} &middot;{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ${doc.status === "completed"
                          ? "bg-green-400"
                          : doc.status === "failed"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                    />
                    <span
                      className={`hidden sm:inline text-xs capitalize ${doc.status === "completed"
                          ? "text-green-400"
                          : doc.status === "failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                    >
                      {doc.status}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewTarget(doc)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition"
                    aria-label={`Preview ${doc.fileName}`}
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
