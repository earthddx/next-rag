"use server";

import { PDFParse } from 'pdf-parse';
import { generateEmbedding, generateEmbeddings } from '@/lib/embeddings';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { chunkContent } from '@/lib/chunking';


export async function processPdfFile(formData: FormData) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }


        const file = formData.get("pdf") as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();


        if (!result.text || !result.text.trim()) {
            return {
                success: false,
                error: "No text found in PDF"
            }
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Create document record
        const document = await prisma.document.create({
            data: {
                userId: user.id,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                filePath: `/uploads/${user.id}/${file.name}`, // adjust as needed
                status: 'processing'
            }
        });

        // Chunk the content
        const chunks = await chunkContent(result.text);
        const embeddings = await generateEmbeddings(chunks);
        // const records = chunks.map((chunk, i) => ({
        //     content: chunk,
        //     embedding: embeddings[i]

        // }));

        // Generate embeddings and save chunks
        // for (let i = 0; i < chunks.length; i++) {
        //     const embedding = await generateEmbedding(chunks[i]);

        //     const chunk = await prisma.documentChunk.create({
        //         data: {
        //             documentId: document.id,
        //             content: chunks[i],
        //             chunkIndex: i,
        //             metadata: {
        //                 pageCount: Array.isArray(result.pages) ? result.pages.length : 0,
        //                 totalPages: Array.isArray(result.pages) ? result.pages.length : 0
        //             }
        //         }
        //     });

        //     // Prisma omits Unsupported (vector) from create input; set embedding via raw SQL
        //     const vectorStr = `[${embedding.join(',')}]`;
        //     await prisma.$executeRaw`
        //         UPDATE "DocumentChunk" SET embedding = ${vectorStr}::vector WHERE id = ${chunk.id}
        //     `;
        // }
        // Create chunks with a transaction
        // Step 1: Create all chunks (single transaction)
        const createdChunks = await prisma.$transaction(
            chunks.map((chunk, i) =>
                prisma.documentChunk.create({
                    data: {
                        documentId: document.id,
                        content: chunk,
                        chunkIndex: i,
                        metadata: {
                            pageCount: Array.isArray(result.pages) ? result.pages.length : 0,
                            totalPages: Array.isArray(result.pages) ? result.pages.length : 0
                        }
                    }
                })
            )
        );

        // Step 2: Update all embeddings (single transaction)
        await prisma.$transaction(
            createdChunks.map((chunk, i) => {
                const vectorStr = `[${embeddings[i].join(',')}]`;
                return prisma.$executeRaw`
        UPDATE "DocumentChunk" 
        SET embedding = ${vectorStr}::vector 
        WHERE id = ${chunk.id}
      `;
            })
        );

        // Update document status
        await prisma.document.update({
            where: { id: document.id },
            data: {
                status: 'completed',
                processedAt: new Date()
            }
        });

        return {
            success: true,
            documentId: document.id,
            chunksCreated: chunks.length
        };


    } catch (e) {
        console.error("PDF Processing error: ", e);
        return { success: false, error: 'Failed to process PDF' }
    }
}