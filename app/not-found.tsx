import Link from "next/link";
import LogoBrand from "@/components/custom/logo-brand";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-blue-400 transition hover:text-blue-300"
        >
          <LogoBrand size="sm" />
          ChatDocs
        </Link>
      </nav>

      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col items-center justify-center text-center">
        <p className="text-6xl font-bold text-blue-400">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
