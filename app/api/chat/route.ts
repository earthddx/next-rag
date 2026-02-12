import { semanticSearch } from '@/lib/search';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool, InferUITools, UIDataTypes, stepCountIs } from "ai";
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authConfig } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';


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
        const { messages }: { messages: ChatMessage[] } = await req.json();
        console.log('💬 User:', userId, '| Messages:', messages.length);

        // model: 'openai/gpt-4o',
        const model = openai('gpt-4.1-mini');
        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model,
            messages: modelMessages,
            system: `You are a helpful assistant with access to a knowledge base.

            For EVERY user question:
            1. ALWAYS use the searchKnowledgeBase tool first
            2. Base your answer on the search results
            3. If search returns "No relevant information found", respond with "Sorry, I don't know."
            4. If search returns results, use that information to answer the question

            Never answer from your own knowledge without searching first.`,
            stopWhen: stepCountIs(2),
            // tools: {
            //     addResource: tool({
            //         description: `add a resource to your knowledge base.
            //         If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
            //         inputSchema: z.object({
            //             content: z
            //                 .string()
            //                 .describe('the content or resource to add to the knowledge base'),
            //         }),
            //         execute: async ({ content }) => createResource({ content }),
            //     }),
            // },
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
        return result.toUIMessageStreamResponse({
            sendSources: true,
            sendReasoning: true,
        });
    } catch (error) {
        console.error('❌ API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }

}