import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { chunkContent } from "@/lib/chunking";
import { generateEmbeddings } from "@/lib/embeddings";
import { put } from "@vercel/blob";

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
  let documentId: string | null = null;

  try {
    // Authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get and validate file
    const formData = await req.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file name
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: "Invalid file extension. Only .pdf files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify PDF magic bytes (PDF signature: %PDF-)
    const pdfSignature = buffer.slice(0, 5).toString();
    if (!pdfSignature.startsWith('%PDF-')) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF file format" },
        { status: 400 }
      );
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${session.user.id}/${timestamp}-${sanitizedFileName}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    const fileUrl = blob.url;

    // Create document record in DB
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: fileUrl, // Store URL path instead of binary
        status: "processing",
      },
    });

    documentId = document.id;

    // Parse PDF text
    const pdfParser = new (PDFParser as any)(null, 1);
    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(new Error(errData.parserError || "PDF parsing failed"))
      );
      pdfParser.on("pdfParser_dataReady", () =>
        resolve(pdfParser.getRawTextContent())
      );
      pdfParser.parseBuffer(buffer);
    });

    if (!text?.trim()) {
      throw new Error("No text content found in PDF");
    }

    // Chunk content
    const chunks = await chunkContent(text);
    if (chunks.length === 0) {
      throw new Error("Failed to create content chunks");
    }

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks);
    if (embeddings.length !== chunks.length) {
      throw new Error("Embedding count mismatch");
    }

    // Create chunks and embeddings in a single transaction
    await prisma.$transaction(async (tx) => {
      // Create all chunks
      const createdChunks = await Promise.all(
        chunks.map((chunk, i) =>
          tx.documentChunk.create({
            data: {
              documentId: document.id,
              content: chunk,
              chunkIndex: i
            },
          })
        )
      );

      // Update chunks with embeddings
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
        data: {
          status: "completed",
          processedAt: new Date()
        },
      });
    }, {
      timeout: 30000, // 30 seconds timeout (increased from default 5s)
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      chunksCreated: chunks.length,
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error("PDF processing error:", error);

    // Update document status to failed if it was created
    if (documentId) {
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            status: "failed",
            processedAt: new Date()
          },
        });
      } catch (updateError) {
        console.error("Failed to update document status:", updateError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
