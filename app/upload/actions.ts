"use server";

import PDFParser from "pdf2json";
import { generateEmbeddings } from '@/lib/embeddings';
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

        console.log('📄 Processing PDF:', file.name, 'Size:', file.size);

        // Parse PDF using pdf2json
        const pdfParser = new (PDFParser as any)(null, 1);

        const text = await new Promise<string>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error('❌ PDF Parser Error:', errData);
                reject(new Error(errData.parserError || 'PDF parsing failed'));
            });
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                console.log('✅ PDF parsed successfully');
                const rawText = pdfParser.getRawTextContent();
                console.log('📝 Extracted text length:', rawText?.length || 0);
                console.log('📝 First 200 chars:', rawText?.substring(0, 200));
                resolve(rawText);
            });
            pdfParser.parseBuffer(buffer);
        });

        console.log('Final text length:', text?.length || 0);
        console.log('Text trimmed length:', text?.trim().length || 0);

        if (!text || !text.trim()) {
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
        const chunks = await chunkContent(text);
        const embeddings = await generateEmbeddings(chunks);

        const createdChunks = await prisma.$transaction(
            chunks.map((chunk, i) =>
                prisma.documentChunk.create({
                    data: {
                        documentId: document.id,
                        content: chunk,
                        chunkIndex: i,
                        metadata: {
                            pageCount: 0, // pdf2json doesn't easily expose page count
                            totalPages: 0
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