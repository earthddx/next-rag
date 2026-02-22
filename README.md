# Next RAG Chat - PDF-based RAG Application

[![Live Demo](https://img.shields.io/badge/Live-Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://next-rag-beta.vercel.app/)

This is a Retrieval-Augmented Generation (RAG) application built with Next.js 16 that allows users to upload PDFs, process them into vector embeddings, and chat with an AI about the document contents.

## Key Technologies:
 - **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
 - **Auth**: NextAuth with OAuth
 - **Database**: PostgreSQL with Prisma ORM
 - **Vector Search**: pgvector extension in PostgreSQL
 - **AI/LLM**: Vercel AI SDK, OpenAI, Anthropic (LangChain)
 - **PDF Processing**: pdf2json for text extraction
 - **File Storage**: Vercel Blob for PDF storage
 - **UI Components**: Radix UI, shadcn/ui components
   
## Core Features:
 - **Authentication** - OAuth-based user authentication
 - **Document Upload** - Upload PDFs (up to 10MB) with validation
   
   ### Processing Pipeline:
 - PDF text extraction using pdf2json
 - Text chunking
 - Embedding generation
 - Vector storage in PostgreSQL with pgvector
 - **Chat Interface** - Query documents using semantic search + LLM responses
 - **Multi-user Support** - User-specific documents and sessions
