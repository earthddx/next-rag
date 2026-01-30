import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const model = openai('gpt-4.1-mini');

        const modelMessages = await convertToModelMessages(messages);
        const result = streamText({
            model,
            messages: modelMessages
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }

}
