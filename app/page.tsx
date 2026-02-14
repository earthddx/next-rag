import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authConfig);

  // If already logged in, skip the landing page
  if (session) {
    redirect("/chatroom");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        {/* Badge / eyebrow */}
        <span className="mb-6 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1 text-sm text-slate-300 backdrop-blur">
          Retrieval-Augmented Generation Playground
        </span>

        {/* Hero */}
        <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          Chat with your own knowledge.
          <br />
          <span className="text-blue-400">Powered by RAG.</span>
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-2xl text-lg leading-8 text-slate-300">
          This app lets you upload or connect your own data and ask questions
          using an AI model grounded in your content.  
          No hallucinations. Just answers backed by your sources.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-400"
          >
            Get started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-600 px-8 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Log in
          </Link>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-sm text-slate-500">
          Built with Next.js, Prisma, and modern LLM tooling
        </p>
      </main>
    </div>
  );
}
