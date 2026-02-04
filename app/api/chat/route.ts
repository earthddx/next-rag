import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, webSearch }: { messages: UIMessage[]; webSearch: boolean; } = await req.json();

        const model = openai('gpt-4.1-mini');

        const modelMessages = await convertToModelMessages(messages);
        const result = streamText({
            model,
            messages: modelMessages,
            system:
                'You are a helpful assistant that can answer questions and help with tasks',
        });

        // send sources and reasoning back to the client
        return result.toUIMessageStreamResponse({
            sendSources: true,
            sendReasoning: true,
        });
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }

}