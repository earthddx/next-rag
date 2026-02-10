import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// const model = openai('gpt-4.1-mini');

export async function generateEmbedding(text: string) {
    const input = text.replace("\n", " ");

    const { embedding } = await embed({
        model: openai.embeddingModel('text-embedding-3-small'),
        value: input,
    });

    return embedding;
}

export async function generateEmbeddings(text: string[]) {
    const inputs = text.map(txt => txt.replace("\n", " "));

    const { embeddings } = await embedMany({
        model: openai.embeddingModel('text-embedding-3-small'),
        values: inputs,
    });

    return embeddings;
}
