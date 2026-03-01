import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import LogoBrand from "@/components/custom/logo-brand";

export default async function AboutPage() {
  const session = await getServerSession(authConfig);
  const isAuthenticated = !!session?.user;
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-blue-400 transition hover:text-blue-300"
        >
          <LogoBrand size="sm" />
          ChatDocs
        </Link>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Link
              href="/chatroom"
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Back to Chat
            </Link>
          ) : (
            <Link
              href="/signup"
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Get started
            </Link>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <span className="mb-4 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1 text-sm text-slate-300 backdrop-blur">
            How it works
          </span>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            What is <span className="text-blue-400">RAG</span>?
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
            Retrieval Augmented Generation — the technique that lets ChatDocs
            answer questions using <em>your</em> documents instead of relying
            solely on pre-trained knowledge.
          </p>
        </header>

        {/* Section: The Problem */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">
            The Problem
          </h2>
          <p className="leading-7 text-slate-300">
            Large Language Models are incredibly powerful, but they have a
            fundamental limitation: they can only reference information from
            their training data. This means they have a knowledge cutoff and
            know nothing about your private documents, proprietary data, or
            recent events. Ask an LLM about the contents of a document you uploaded
            yesterday, and it simply can&apos;t help.
          </p>
        </section>

        {/* Section: The Solution */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">
            The Solution: RAG
          </h2>
          <p className="mb-4 leading-7 text-slate-300">
            <strong className="text-white">
              RAG (Retrieval Augmented Generation)
            </strong>{" "}
            is the process of providing an LLM with specific information
            relevant to the user&apos;s prompt. Instead of relying on memorized
            training data, the model receives fresh, relevant context at query
            time — leading to accurate, grounded answers.
          </p>
          <p className="leading-7 text-slate-300">
            Think of it like an open-book exam: rather than recalling answers
            from memory, the model looks up the right information before
            responding.
          </p>
        </section>

        {/* Section: Key Concepts */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-slate-100">
            Key Concepts
          </h2>

          <div className="space-y-10">
            {/* Chunking */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 text-xl font-semibold text-blue-400">
                1. Chunking
              </h3>
              <p className="leading-7 text-slate-300">
                Documents are broken into smaller, meaningful pieces called{" "}
                <strong className="text-white">chunks</strong>. This is
                important because embedding models produce higher quality
                representations for smaller, focused inputs than for large
                documents. A simple approach is to split by sentences, but more
                advanced strategies can split by paragraphs or semantic
                boundaries.
              </p>
            </div>

            {/* Embeddings */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 text-xl font-semibold text-blue-400">
                2. Embeddings
              </h3>
              <p className="leading-7 text-slate-300">
                Each chunk is converted into a{" "}
                <strong className="text-white">vector embedding</strong> — a
                list of numbers that captures its semantic meaning. Words and
                phrases with similar meanings end up close together in this
                high-dimensional space. Similarity between embeddings is
                measured using{" "}
                <strong className="text-white">cosine similarity</strong>,
                ranging from 1 (identical meaning) to -1 (opposite meaning).
              </p>
            </div>

            {/* Storage */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 text-xl font-semibold text-blue-400">
                3. Storage
              </h3>
              <p className="leading-7 text-slate-300">
                The chunks and their embeddings are stored together in a
                database. Each record holds the original text content alongside
                its vector representation, allowing fast similarity searches
                later.
              </p>
            </div>
          </div>
        </section>

        {/* Diagram 1: Chunking & Embedding Pipeline */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">
            How Documents Are Prepared
          </h2>
          <p className="mb-6 leading-7 text-slate-300">
            When you upload a document to ChatDocs, it goes through this
            pipeline: the source material is chunked into smaller pieces, each
            chunk is converted into an embedding, and then both the content and
            embedding are stored in the database.
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
            <Image
              src="/images/rag-guide-1-dark.png"
              alt="Diagram showing the document preparation pipeline: Source Material is chunked into smaller pieces, each chunk is converted into an embedding vector, and then stored in the database with its content and embedding."
              width={1564}
              height={316}
              className="w-full"
            />
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            Source Material → Chunks → Embeddings → Storage
          </p>
        </section>

        {/* Diagram 2: Query Flow */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">
            How Queries Are Answered
          </h2>
          <p className="mb-6 leading-7 text-slate-300">
            When you ask a question, the query itself is embedded into the same
            vector space. The system then retrieves the most semantically
            similar chunks from the database. These chunks are passed as context
            alongside your question to the LLM, which generates an answer
            grounded in your actual documents.
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
            <Image
              src="/images/rag-guide-2-dark.png"
              alt="Diagram showing the RAG query flow: User Query is embedded into a vector, similar chunks are retrieved from the database based on cosine similarity, and then the matched content is passed as context to the LLM alongside the original question."
              width={1564}
              height={316}
              className="w-full"
            />
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            User Query → Embedding → Semantic Search → LLM with Context
          </p>
        </section>

        {/* Section: Why RAG */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-slate-100">
            Why RAG Matters
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 font-semibold text-white">Accuracy</h3>
              <p className="text-sm leading-6 text-slate-400">
                Answers are grounded in your actual documents, dramatically
                reducing hallucinations.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 font-semibold text-white">Privacy</h3>
              <p className="text-sm leading-6 text-slate-400">
                Your data stays in your database. The LLM only sees relevant
                chunks at query time.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
              <h3 className="mb-2 font-semibold text-white">Up-to-date</h3>
              <p className="text-sm leading-6 text-slate-400">
                Upload new documents anytime. No need to retrain a model — RAG
                uses fresh data instantly.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">
            {isAuthenticated ? "Ready to chat?" : "Ready to try it?"}
          </h2>
          <p className="mb-8 text-slate-300">
            Upload your documents and start chatting with them in seconds.
          </p>
          <Link
            href={isAuthenticated ? "/chatroom" : "/signup"}
            className="inline-block rounded-xl bg-blue-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-400"
          >
            {isAuthenticated ? "Back to Chat" : "Get started for free"}
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          Based on the{" "}
          <a
            href="https://ai-sdk.dev/cookbook/guides/rag-chatbot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline underline-offset-2 transition hover:text-blue-300"
          >
            Vercel AI SDK RAG Guide
          </a>
        </footer>
      </main>
    </div>
  );
}
