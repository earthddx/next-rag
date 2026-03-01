export const MIME_PDF = "application/pdf";
export const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const WORD_MIME_TYPES: string[] = [MIME_DOCX];
export const ALLOWED_MIME_TYPES: string[] = [MIME_PDF, MIME_DOCX];
export const ACCEPTED_FILE_TYPES = `${MIME_PDF},.pdf,${MIME_DOCX},.docx`;
