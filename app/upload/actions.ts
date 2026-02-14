"use server";

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateEmbeddings } from '@/lib/embeddings';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { chunkContent } from '@/lib/chunking';

// Disable worker for serverless environment
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

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

        // Parse PDF
        const loadingTask = pdfjsLib.getDocument({
            data: buffer,
            useSystemFonts: true,
            disableFontFace: true,
        });
        
        const pdfDocument = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        if (!fullText || !fullText.trim()) {
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
                filePath: `/uploads/${user.id}/${file.name}`,
                status: 'processing'
            }
        });

        // Chunk the content
        const chunks = await chunkContent(fullText);
        const embeddings = await generateEmbeddings(chunks);

        const createdChunks = await prisma.$transaction(
            chunks.map((chunk, i) =>
                prisma.documentChunk.create({
                    data: {
                        documentId: document.id,
                        content: chunk,
                        chunkIndex: i,
                        metadata: {
                            pageCount: pdfDocument.numPages,
                            totalPages: pdfDocument.numPages
                        }
                    }
                })
            )
        );

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