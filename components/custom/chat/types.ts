export type FileMetadata = {
    isPdfUpload?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
};

export type PreviewFile = {
    url: string;
    fileName: string;
    fileType?: string
};

export type UploadEvent = {
    progress?: number;
    label?: string;
    result?: any;
    error?: string
};