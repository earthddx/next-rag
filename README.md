# Next RAG Chat - Document-based RAG Application

[![Live Demo](https://img.shields.io/badge/Live-Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://next-rag-beta.vercel.app/)

This is a Retrieval-Augmented Generation (RAG) application built with Next.js 16 that allows users to upload documents, process them into vector embeddings, and chat with an AI about the document contents.

## Key Technologies:
 - **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
 - **Auth**: NextAuth with OAuth
 - **Database**: PostgreSQL with Prisma ORM
 - **Vector Search**: pgvector extension in PostgreSQL
 - **AI/LLM**: Vercel AI SDK, OpenAI, Anthropic (LangChain)
 - **Document Processing**: pdf2json, mammoth, officeparser for multi-format text extraction
 - **File Storage**: Vercel Blob for document storage
 - **UI Components**: Radix UI, shadcn/ui components

## Core Features:
 - **Authentication** - OAuth-based user authentication
 - **Document Upload** - Upload documents up to 10MB with MIME type, extension, and magic-byte validation

   ### Supported File Formats:

   | Format | Extension(s) | Parser |
   |--------|-------------|--------|
   | PDF | `.pdf` | pdf2json |
   | Word | `.docx` | mammoth |
   | Excel | `.xlsx` | officeparser |
   | PowerPoint | `.pptx` | officeparser |
   | OpenDocument Text | `.odt` | officeparser |
   | OpenDocument Spreadsheet | `.ods` | officeparser |
   | OpenDocument Presentation | `.odp` | officeparser |
   | Rich Text Format | `.rtf` | officeparser |
   | Plain Text | `.txt` | UTF-8 decode |
   | CSV | `.csv` | UTF-8 decode |
   | Markdown | `.md` | UTF-8 decode |
   | HTML | `.html`, `.htm` | UTF-8 decode + tag strip |

   ### Processing Pipeline:
 - Text extraction (format-specific parsers per file type)
 - Text chunking
 - Embedding generation
 - Vector storage in PostgreSQL with pgvector
 - **Chat Interface** - Query documents using semantic search + LLM responses
 - **Multi-user Support** - User-specific documents and sessions
