import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
    separators: [" "]
});

export async function chunkContent(content: string) {
    return await splitter.splitText(content.trim());
}