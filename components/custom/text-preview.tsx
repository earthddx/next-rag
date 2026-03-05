"use client";

import React from "react";

export function getExt(fileName: string) {
  return fileName.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
}

export function TextPreview({ url }: { url: string }) {
  const [content, setContent] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setContent(null);
    setError(false);
    fetch(url).then((r) => r.text()).then(setContent).catch(() => setError(true));
  }, [url]);

  if (error) return <p className="p-4 text-sm text-red-400">Failed to load content.</p>;
  if (!content) return <p className="p-4 text-sm text-slate-400">Loading…</p>;
  return (
    <pre className="w-full h-full overflow-auto p-4 text-sm font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap wrap-break-word">
      {content}
    </pre>
  );
}
