export const MIME_PDF = "application/pdf";
export const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const MIME_PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
export const MIME_ODT = "application/vnd.oasis.opendocument.text";
export const MIME_ODS = "application/vnd.oasis.opendocument.spreadsheet";
export const MIME_ODP = "application/vnd.oasis.opendocument.presentation";
export const MIME_RTF = "application/rtf";
export const MIME_RTF_ALT = "text/rtf";
export const MIME_TXT = "text/plain";
export const MIME_CSV = "text/csv";
export const MIME_MARKDOWN = "text/markdown";
export const MIME_HTML = "text/html";

export const WORD_MIME_TYPES: string[] = [MIME_DOCX, MIME_ODT];
export const EXCEL_MIME_TYPES: string[] = [MIME_XLSX, MIME_ODS];
export const PRESENTATION_MIME_TYPES: string[] = [MIME_PPTX, MIME_ODP];

// Formats renderable by Microsoft Office Online Viewer (view.officeapps.live.com).
// Everything else falls back to the raw Blob URL — the browser can handle PDF and
// plain-text formats natively, but binary formats not listed here would download.
export const OFFICE_VIEWER_MIME_TYPES: string[] = [
  ...WORD_MIME_TYPES,
  ...EXCEL_MIME_TYPES,
  ...PRESENTATION_MIME_TYPES,
  MIME_RTF, MIME_RTF_ALT,
];

// Extensions corresponding to OFFICE_VIEWER_MIME_TYPES.
// Used as the primary routing signal because browser-reported MIME types for
// office formats can be unreliable (e.g. application/octet-stream on some systems).
const OFFICE_VIEWER_EXTENSIONS = new Set([
  ".docx", ".odt",
  ".xlsx", ".ods",
  ".pptx", ".odp",
  ".rtf",
]);

// Plain-text formats that must be fetched and rendered directly (browsers may
// download text/csv and text/markdown instead of displaying them inline).
export const TEXT_PREVIEW_EXTENSIONS = new Set([".csv", ".txt", ".md"]);

/** Returns true when the file should be opened via the Office Online Viewer. */
export function needsOfficeViewer(fileName: string, fileType?: string): boolean {
  const ext = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext && OFFICE_VIEWER_EXTENSIONS.has(ext)) return true;
  return OFFICE_VIEWER_MIME_TYPES.includes(fileType ?? "");
}

export const ALLOWED_MIME_TYPES: string[] = [
  MIME_PDF,
  MIME_DOCX, MIME_XLSX, MIME_PPTX,
  MIME_ODT, MIME_ODS, MIME_ODP,
  MIME_RTF, MIME_RTF_ALT,
  // text/plain covers .txt, and also .md/.csv when browsers don't send the specific MIME
  MIME_TXT, MIME_CSV, MIME_MARKDOWN, MIME_HTML,
];

export const ACCEPTED_FILE_TYPES = [
  `${MIME_PDF},.pdf`,
  `${MIME_DOCX},.docx`,
  `${MIME_XLSX},.xlsx`,
  `${MIME_PPTX},.pptx`,
  `${MIME_ODT},.odt`,
  `${MIME_ODS},.ods`,
  `${MIME_ODP},.odp`,
  `${MIME_RTF},.rtf`,
  `${MIME_TXT},.txt`,
  `${MIME_CSV},.csv`,
  `${MIME_MARKDOWN},.md`,
  `${MIME_HTML},.html,.htm`,
].join(",");
