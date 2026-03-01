export const MIME_PDF = "application/pdf";
export const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MIME_DOC = "application/msword";

export const WORD_MIME_TYPES: string[] = [MIME_DOCX, MIME_DOC];
export const ALLOWED_MIME_TYPES: string[] = [MIME_PDF, MIME_DOCX, MIME_DOC];
export const ACCEPTED_FILE_TYPES = `${MIME_PDF},.pdf,${MIME_DOCX},.docx,${MIME_DOC},.doc`;
