"use client";

import React from "react";
import type { ChatStatus, UIDataTypes, UIMessage, UITools } from "ai";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { FileTextIcon } from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";
import { FileMetadata, PreviewFile } from "./types";

export default ({ messages, isLoadingSession, isProcessingFile, isStreaming, setPreviewFile, status }: {
    messages: UIMessage<unknown, UIDataTypes, UITools>[],
    isLoadingSession: boolean,
    isProcessingFile: boolean,
    isStreaming: boolean,
    setPreviewFile: React.Dispatch<React.SetStateAction<PreviewFile | null>>,
    status: ChatStatus
}) => {

    return <Conversation id="chat-conversation" className="flex justify-center">
        <ConversationContent className="max-w-3xl m-auto">
            {isLoadingSession ? (
                <div className="flex items-center justify-center h-full">
                    <Loader />
                </div>
            ) : messages.length === 0 ? (
                <ConversationEmptyState
                    title="Start a conversation"
                    description="Type a message or upload a document (PDF, DOCX) to begin"
                />
            ) : (
                messages.map((message: UIMessage) => (
                    <Message key={message.id} from={message.role}>
                        <MessageContent>
                            {message.role === "assistant" ? (
                                <div className="space-y-2">
                                    <MessageResponse>
                                        {message.parts
                                            ?.filter((part: any) => part.type === "text")
                                            .map((part: any) => part.text)
                                            .join("")}
                                    </MessageResponse>
                                    {/* Show preview button for document uploads */}
                                    {(() => {
                                        const metadata = message.metadata as FileMetadata;
                                        if (!metadata?.isPdfUpload || !metadata?.fileUrl) return null;
                                        return (
                                            <button
                                                onClick={() => setPreviewFile({
                                                    url: metadata.fileUrl!,
                                                    fileName: metadata.fileName!,
                                                    fileType: metadata.fileType,
                                                })}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                            >
                                                <FileTextIcon className="size-4" />
                                                View file
                                            </button>
                                        );
                                    })()}
                                </div>
                            ) : (
                                message.parts
                                    ?.filter((part: any) => part.type === "text")
                                    .map((part: any) => part.text)
                            )}
                        </MessageContent>
                    </Message>
                ))
            )}
            {(status === "submitted" || status === "streaming" || isProcessingFile || isStreaming) && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
    </Conversation>
}
