import { semanticSearch } from '@/lib/search';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool, InferUITools, UIDataTypes, stepCountIs } from "ai";
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authConfig } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';


//TODO: 
// useChat default – In RagChat.tsx I call useChat() with no options. 
// The Vercel AI SDK useChat hook defaults to sending POST requests to /api/chat.

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export type ChatTools = InferUITools<any>; //<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>


export async function POST(req: Request) {
    const session = await getServerSession(authConfig);
    console.log("CHAT ROUTE:", session?.user)

    if (!session?.user?.id && !session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { messages, sessionId }: { messages: ChatMessage[], sessionId?: string } = await req.json();
        console.log('💬 User:', userId, '| Messages:', messages.length, '| Session:', sessionId);

        // model: 'openai/gpt-4o',
        const model = openai('gpt-4.1-mini');
        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model,
            messages: modelMessages,
            system: `You are a RAG (Retrieval-Augmented Generation) assistant. You can ONLY answer questions based on the user's uploaded documents.

            CRITICAL RULES - NO EXCEPTIONS:
            1. ALWAYS use the searchKnowledgeBase tool first for EVERY question
            2. If search returns "No relevant information found", you MUST respond EXACTLY with: "Sorry, I don't know."
            3. You are FORBIDDEN from using your general knowledge, training data, or any information outside the search results
            4. This applies to ALL questions - coding, general knowledge, weather, math, EVERYTHING
            5. If the answer is not in the knowledge base, say "Sorry, I don't know." - DO NOT make up answers or use general knowledge

            Your ONLY source of truth is the searchKnowledgeBase tool results. Nothing else.`,
            stopWhen: stepCountIs(2),
            tools: {
                searchKnowledgeBase: tool({
                    description: `Search the knowledge base for information relevant to the user's question. 
                    Use this tool for ANY question the user asks to find relevant information.`,
                    inputSchema: z.object({
                        query: z.string().describe("The search query to find relevant documents")
                    }),
                    execute: async ({ query }) => {
                        try {
                            console.log('🔍 Searching for:', query, '| User:', userId);
                            const results = await semanticSearch({ query, userId, limit: 20, minScore: 0 });
                            console.log('📊 Search results:', results.length, 'found');

                            if (!results.length) {
                                return "No relevant information found in the knowledge base"
                            }

                            const formattedResults = results
                                .map((res, i) => `[${i + 1}] ${res.content}`)
                                .join("\n\n");

                            return formattedResults
                        } catch (e) {
                            console.error("❌ Search error: ", e);
                            return "Error searching the knowledge base"
                        }
                    }
                })
            }
        });

        // send sources and reasoning back to the client
        const response = result.toUIMessageStreamResponse({
            sendSources: true,
            sendReasoning: true,
        });

        // Save messages to database after streaming (background task)
        if (sessionId) {
            // Save asynchronously without blocking the response
            saveMessagesToDatabase(sessionId, messages, userId).catch((error) => {
                console.error('❌ Error saving messages:', error);
            });
        }

        return response;
    } catch (error) {
        console.error('❌ API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }

}

// Helper function to save messages to database
async function saveMessagesToDatabase(
    sessionId: string,
    messages: ChatMessage[],
    userId: string
) {
    try {
        // Verify session belongs to user
        const session = await prisma.chatSession.findFirst({
            where: { id: sessionId, userId }
        });

        if (!session) {
            console.error('Session not found or unauthorized');
            return;
        }

        // Get existing message IDs to avoid duplicates
        const existingMessages = await prisma.message.findMany({
            where: { sessionId },
            select: { id: true }
        });
        const existingIds = new Set(existingMessages.map(m => m.id));

        // Filter out messages that already exist
        const newMessages = messages.filter(msg => !existingIds.has(msg.id));

        if (newMessages.length === 0) {
            return;
        }

        // Save new messages
        await prisma.message.createMany({
            data: newMessages.map(msg => ({
                id: msg.id,
                sessionId,
                role: msg.role,
                content: msg.parts
                    ?.filter(part => part.type === 'text')
                    .map(part => part.text)
                    .join('') || '',
                metadata: msg.metadata || undefined
            })),
            skipDuplicates: true
        });

        // Update session timestamp
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() }
        });

        console.log(`💾 Saved ${newMessages.length} messages to session ${sessionId}`);
    } catch (error) {
        console.error('Error in saveMessagesToDatabase:', error);
        throw error;
    }
}