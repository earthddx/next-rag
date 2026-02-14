# RAG PDF App

A Retrieval-Augmented Generation (RAG) application that allows users to
upload PDFs, embed their contents, and query them using an LLM with
grounded responses.

Built with **Next.js 16 (App Router)** and a Postgres + pgvector vector
store, this project demonstrates a full document ingestion → embedding →
retrieval → generation pipeline.

> Status: Actively evolving.

------------------------------------------------------------------------

## Tech Stack

-   **Next.js 16 (App Router)**
-   **TypeScript**
-   **NextAuth** (OAuth authentication)
-   **Prisma ORM**
-   **PostgreSQL**
-   **pgvector** (vector similarity search)
-   **pdf-parse** (PDF text extraction)
-   **Vercel AI SDK**
-   **AI Elements** (chat + UI primitives)

------------------------------------------------------------------------

## What This App Does

1.  User uploads a PDF\
2.  PDF is parsed using `pdf-parse`\
3.  Text is chunked and embedded\
4.  Embeddings are stored in PostgreSQL using `pgvector`\
5.  User asks a question\
6.  Query is embedded\
7.  Similar chunks are retrieved via vector similarity search\
8.  Retrieved context is injected into the LLM prompt\
9.  LLM generates a grounded answer

------------------------------------------------------------------------

## Features

### Authentication

-   OAuth authentication via NextAuth
-   User persistence with Prisma
-   Protected routes and API endpoints

### Document Ingestion

-   PDF upload support
-   Text extraction using `pdf-parse`
-   Chunking pipeline
-   Embedding generation
-   Vector storage with `pgvector`

### Retrieval & Generation

-   Semantic similarity search in Postgres
-   Context-aware prompt construction
-   Streaming chat responses using AI SDK
-   Chat UI powered by AI Elements

------------------------------------------------------------------------

## Architecture Overview

### 1. Auth Layer

-   OAuth login via NextAuth
-   Prisma persists users in PostgreSQL

### 2. Ingestion Pipeline

-   PDF → text extraction (`pdf-parse`)
-   Text → chunking
-   Chunk → embedding
-   Embedding → stored in Postgres (`pgvector` column)

### 3. Query Pipeline

-   User query → embedding
-   Vector similarity search via `pgvector`
-   Top-K chunks retrieved
-   Context injected into LLM prompt
-   LLM generates grounded answer

------------------------------------------------------------------------

## Database

-   PostgreSQL
-   Prisma as ORM
-   `pgvector` extension enabled
-   Embeddings stored directly in Postgres (no external vector DB)

------------------------------------------------------------------------

## Local Development

Install dependencies:

``` bash
npm install
```

Run the development server:

``` bash
npm run dev
```

Then open:

http://localhost:3000

------------------------------------------------------------------------

## Environment Variables

You will need:

-   `DATABASE_URL`
-   `NEXTAUTH_SECRET`
-   OAuth provider credentials
-   AI provider API key (used by AI SDK)

------------------------------------------------------------------------

## Why This Project

This project demonstrates:

-   End-to-end RAG implementation
-   Production-style vector search using Postgres
-   Modern Next.js App Router patterns
-   Streaming LLM responses
-   Secure multi-user architecture

------------------------------------------------------------------------

## Future Improvements

-   Other extensions (not only .pdf)
-   Smarter chunking strategy
-   Metadata filtering
-   Hybrid search (BM25 + vector)
-   Conversation memory
-   Document management dashboard
-   Rate limiting / quota system
-   WhatsApp chatbot integration
-   Discord bot integration

------------------------------------------------------------------------

## Deployment

This app can be deployed on Vercel or any Node-compatible hosting
platform with:

-   PostgreSQL + pgvector
-   Proper environment variables
-   AI provider credentials
