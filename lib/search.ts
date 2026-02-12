// lib/semantic-search.ts
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

type SearchOptions = {
    query: string;
    userId: string;         // only search this user's docs
    limit?: number;         // top-k
    minScore?: number;      // optional threshold (0–1)
};

export async function semanticSearch({
    query,
    userId,
    limit = 5,
    minScore = 0.7,
}: SearchOptions) {
    // 1) Embed the query
    const embedding = await generateEmbedding(query);
    const vectorStr = `[${embedding.join(",")}]`; // pgvector literal

    // 2) Similarity search over DocumentChunk using pgvector
    //    Using 1 - distance as a "similarity" score in [0,1]-ish
    const rows = await prisma.$queryRaw<
        {
            id: string;
            content: string;
            documentId: string;
            similarity: number;
        }[]
    >`
    SELECT 
      c."id",
      c."content",
      c."documentId",
      1 - (c."embedding" <=> ${vectorStr}::vector) AS "similarity"
    FROM "DocumentChunk" c
    JOIN "Document" d ON c."documentId" = d."id"
    WHERE d."userId" = ${userId}
    ORDER BY c."embedding" <=> ${vectorStr}::vector
    LIMIT ${limit}
  `;

    console.log('Raw query returned', rows.length, 'rows');
    if (rows.length > 0) {
        console.log('Top similarity:', rows[0]?.similarity, 'Sample content:', rows[0]?.content?.slice(0, 50));
    }
    return rows.filter((r) => r.similarity >= minScore);
}