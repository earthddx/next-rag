import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import officeParser from "officeparser";
import { writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { chunkContent } from "@/lib/chunking";
import { generateEmbeddings } from "@/lib/embeddings";
import { put } from "@vercel/blob";
import { ALLOWED_MIME_TYPES } from "@/lib/file-types";

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type FileCategory = "pdf" | "docx" | "doc";

function getFileCategory(filename: string): FileCategory | null {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (ext === ".doc") return "doc";
  return null;
}

function validateMagicBytes(buffer: Buffer, category: FileCategory): boolean {
  if (category === "pdf") {
    return buffer.subarray(0, 5).toString().startsWith("%PDF-");
  }
  if (category === "docx") {
    // DOCX is a ZIP file (PK signature)
    return buffer[0] === 0x50 && buffer[1] === 0x4b;
  }
  if (category === "doc") {
    // DOC is an OLE2 Compound Document
    return buffer[0] === 0xd0 && buffer[1] === 0xcf;
  }
  return false;
}

async function extractText(buffer: Buffer, category: FileCategory, filename: string): Promise<string> {
  if (category === "pdf") {
    const pdfParser = new (PDFParser as any)(null, 1);
    return new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(new Error(errData.parserError || "PDF parsing failed"))
      );
      pdfParser.on("pdfParser_dataReady", () =>
        resolve(pdfParser.getRawTextContent())
      );
      pdfParser.parseBuffer(buffer);
    });
  }
  if (category === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (category === "doc") {
    const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);
    await writeFile(tmpPath, buffer);
    try {
      return (await officeParser.parseOffice(tmpPath)).toText();
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  }
  throw new Error("Unsupported file type");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file provided" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Invalid file type. Only PDF, DOCX, and DOC files are allowed" },
      { status: 400 }
    );
  }

  const category = getFileCategory(file.name);
  if (!category) {
    return NextResponse.json(
      { success: false, error: "Invalid file extension. Only .pdf, .docx, and .doc files are allowed" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!validateMagicBytes(buffer, category)) {
    return NextResponse.json(
      { success: false, error: "Invalid file format" },
      { status: 400 }
    );
  }

  // ── Streaming processing ───────────────────────────────────────────────────
  const userId = session.user.id;
  const fileName = file.name;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (data: object) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));

      let documentId: string | null = null;

      try {
        // 1. Upload to Vercel Blob
        send({ progress: 10, label: "Uploading to storage…" });
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueFileName = `${userId}/${timestamp}-${sanitizedFileName}`;
        const blob = await put(uniqueFileName, buffer, {
          access: "public",
          contentType: file.type,
        });
        const fileUrl = blob.url;

        // 2. Create document record in DB
        const document = await prisma.document.create({
          data: {
            userId,
            fileName,
            fileType: file.type,
            fileSize: file.size,
            filePath: fileUrl,
            status: "processing",
          },
        });
        documentId = document.id;

        // 3. Parse document
        const parseLabel = category === "pdf" ? "Parsing PDF…" : category === "docx" ? "Parsing DOCX…" : "Parsing DOC…";
        send({ progress: 25, label: parseLabel });

        const text = await extractText(buffer, category, fileName);

        if (!text?.trim()) {
          throw new Error("No text content found in document");
        }

        // 4. Chunk content
        send({ progress: 50, label: "Splitting into chunks…" });
        const chunks = await chunkContent(text);
        if (chunks.length === 0) throw new Error("Failed to create content chunks");

        // 5. Generate embeddings
        send({ progress: 65, label: `Generating embeddings for ${chunks.length} chunks…` });
        const embeddings = await generateEmbeddings(chunks);
        if (embeddings.length !== chunks.length) throw new Error("Embedding count mismatch");

        // 6. Save chunks and embeddings in a single transaction
        send({ progress: 85, label: "Saving to database…" });
        await prisma.$transaction(
          async (tx) => {
            const createdChunks = await Promise.all(
              chunks.map((chunk, i) =>
                tx.documentChunk.create({
                  data: { documentId: document.id, content: chunk, chunkIndex: i },
                })
              )
            );
            await Promise.all(
              createdChunks.map((chunk, i) => {
                const vectorStr = `[${embeddings[i].join(",")}]`;
                return tx.$executeRaw`
                  UPDATE "DocumentChunk"
                  SET embedding = ${vectorStr}::vector
                  WHERE id = ${chunk.id}
                `;
              })
            );
            // Update document status to completed
            await tx.document.update({
              where: { id: document.id },
              data: { status: "completed", processedAt: new Date() },
            });
          },
          { timeout: 30000 }
        );

        // 7. Done
        send({
          progress: 100,
          label: "Done",
          result: { success: true, documentId: document.id, chunksCreated: chunks.length, fileUrl },
        });
      } catch (error) {
        console.error("Document processing error:", error);
        if (documentId) {
          try {
            await prisma.document.update({
              where: { id: documentId },
              data: { status: "failed", processedAt: new Date() },
            });
          } catch (updateError) {
            console.error("Failed to update document status:", updateError);
          }
        }
        const errorMessage = error instanceof Error ? error.message : "Failed to process document";
        send({ error: errorMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
