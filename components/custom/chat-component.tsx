"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputTools,
    PromptInputFooter,
    PromptInputActionMenu,
    PromptInputActionMenuTrigger,
    PromptInputActionMenuContent,
    PromptInputActionAddAttachments,
    usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
    Attachments,
    Attachment,
    AttachmentPreview,
    AttachmentInfo,
    AttachmentRemove,
} from "@/components/ai-elements/attachments";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { FileTextIcon } from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";

const suggestions = [
    "What documents have been uploaded?",
    "Summarize the key points from my documents",
    "Search for specific information in my files",
    "What are the main topics in my documents?",
];

const dataURItoFile = async (dataURI: string, filename: string): Promise<File> => {
    const response = await fetch(dataURI);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

const AttachmentsPreview = () => {
    const attachments = usePromptInputAttachments();

    if (attachments.files.length === 0) {
        return null;
    }

    return (
        <div className="px-2 pb-2">
            <Attachments variant="inline">
                {attachments.files.map((file) => (
                    <Attachment
                        key={file.id}
                        data={file}
                        onRemove={() => attachments.remove(file.id)}
                    >
                        <AttachmentPreview
						className="font-15px"
                            fallbackIcon={<FileTextIcon className="size-4 text-muted-foreground" />}
                        />
                        <AttachmentInfo />
                        <AttachmentRemove label="Remove file" />
                    </Attachment>
                ))}
            </Attachments>
        </div>
    );
}

export default function Chat() {
    const [input, setInput] = React.useState("");
    const [isProcessingPdf, setIsProcessingPdf] = React.useState(false);

    const { messages, sendMessage, setMessages, status } = useChat();

    const isLoading = status === "streaming" || status === "submitted" || isProcessingPdf;

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage({ text: suggestion });
    };

    const handleSubmit = async (message: any, event: React.FormEvent) => {
        event.preventDefault();

        // Handle PDF file uploads
        if (message.files && message.files.length > 0) {
            setIsProcessingPdf(true);

            for (const fileData of message.files) {
                const userMessageText = message.text || `Uploading file: ${fileData.filename}`;
                const userMessage = {
                    id: crypto.randomUUID(),
                    role: "user" as const,
                    parts: [{ type: "text" as const, text: userMessageText }],
                };
                setMessages((prev) => [...prev, userMessage]);

                try {
                    // Convert base64 data URI to File object
                    const file = await dataURItoFile(fileData.url, fileData.filename);

                    const formData = new FormData();
                    formData.set("pdf", file);

                    // Call the API route directly
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    const result = await response.json();

                    if (result.success) {
                        toast.success("PDF Processed", {
                            description: `Successfully processed ${fileData.filename}. ${result.chunksCreated} chunks created.`,
                        });

                        const assistantMessage = {
                            id: crypto.randomUUID(),
                            role: "assistant" as const,
                            parts: [{
                                type: "text" as const,
                                text: `✅ Successfully processed ${fileData.filename} (${result.chunksCreated} chunks created)`
                            }],
                        };
                        setMessages((prev) => [...prev, assistantMessage]);
                    } else {
                        toast.error("Upload Failed", {
                            description: result.error ?? "Failed to process PDF.",
                        });

                        const errorMessage = {
                            id: crypto.randomUUID(),
                            role: "assistant" as const,
                            parts: [{
                                type: "text" as const,
                                text: `❌ Failed to process ${fileData.filename}: ${result.error || 'Unknown error'}`
                            }],
                        };
                        setMessages((prev) => [...prev, errorMessage]);
                    }
                } catch (error) {
                    console.error("Error converting or processing file:", error);
                    toast.error("Error", {
                        description: "Failed to process the PDF file.",
                    });

                    const errorMessage = {
                        id: crypto.randomUUID(),
                        role: "assistant" as const,
                        parts: [{
                            type: "text" as const,
                            text: `❌ Error processing ${fileData.filename}`
                        }],
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                }
            }

            setInput("");
            setIsProcessingPdf(false);
        }
        // Handle text-only messages
        else if (message.text) {
            sendMessage({ text: message.text });
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <Conversation className="flex justify-center">
                <ConversationContent className="max-w-3xl m-auto">
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            title="Start a conversation"
                            description="Type a message or upload a PDF to begin"
                        />
                    ) : (
                        messages.map((message) => (
                            <Message key={message.id} from={message.role}>
                                <MessageContent>
                                    {message.role === "assistant" ? (
                                        <MessageResponse>
                                            {message.parts
                                                ?.filter((part) => part.type === "text")
                                                .map((part) => part.text)
                                                .join("")}
                                        </MessageResponse>
                                    ) : (
                                        message.parts?.map(
                                            (part) => part.type === "text" && part.text,
                                        )
                                    )}
                                </MessageContent>
                            </Message>
                        ))
                    )}
                    {(status === "submitted" || status === "streaming" || isProcessingPdf) && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            <div className="border-t p-4">
                <Suggestions className="px-4 overflow-auto max-w-3xs sm:max-w-3xl mx-auto">
                    {suggestions.map((suggestion) => (
                        <Suggestion
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            suggestion={suggestion}
                        />
                    ))}
                </Suggestions>

                <div className="max-w-3xl mx-auto">
                    <PromptInput
                        accept="application/pdf,.pdf"
                        onSubmit={handleSubmit}
                        className="flex gap-2 items-end"
                    >
                        {/* Show attachment previews */}
                        <AttachmentsPreview />

                        <PromptInputTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message or upload a PDF..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-1"
                        />
                        <PromptInputFooter>
                            <PromptInputTools>
                                <PromptInputActionMenu>
                                    <PromptInputActionMenuTrigger />
                                    <PromptInputActionMenuContent>
                                        <PromptInputActionAddAttachments label="Add PDF file" />
                                    </PromptInputActionMenuContent>
                                </PromptInputActionMenu>
                            </PromptInputTools>
                            <PromptInputSubmit disabled={isLoading} />
                        </PromptInputFooter>
                    </PromptInput>
                </div>
            </div>
        </div>
    );
}