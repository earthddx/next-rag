## RAG App (WIP)
My first take on a Retrieval-Augmented Generation (RAG) application built with Next.js and OAuth authentication via NextAuth.
This project is currently work in progress and evolving.

## Tech Stack

- Next.js (App Router)

- TypeScript

- NextAuth (OAuth)
  
- Prisma (user persistence)

- Database (used via Prisma)

- Vector store (TBD)

- LLM integration (TBD)

- Embeddings pipeline (TBD)

## Features (So Far)

- OAuth authentication using NextAuth
  
- User persistence via Prisma

- Protected routes / API endpoints

- Initial RAG architecture setup

- Document ingestion pipeline (in progress)

- Retrieval + generation flow (in progress)

## High-Level Architecture

- User authenticates via OAuth (NextAuth)

- Documents are embedded and stored in a vector database

- User query → embedding → similarity search

- Retrieved context is injected into the LLM prompt

- LLM generates a grounded response

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
