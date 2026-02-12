"use client";

import { useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import ButtonScrollDown from "./ButtonScrollDown";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageBranch,
    MessageBranchContent,
    MessageBranchNext,
    MessageBranchPrevious,
    MessageBranchPage,
    MessageBranchSelector,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputBody,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Loader } from "@/components/ai-elements/loader";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";

const suggestions = [
    "What documents have been uploaded?",
    "Summarize the key points from my documents",
    "Search for specific information in my files",
    "What are the main topics in my documents?",
];

export default function RAGChatBot() {
    const [text, setText] = useState("");
    const { messages, sendMessage, status } = useChat();

    const handleSubmit = (message: PromptInputMessage) => {
        if (!message.text) {
            return;
        }
        sendMessage({
            text: message.text,
        });
        setText("");
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage({ text: suggestion });
    };


    return (
        <div className="mx-auto flex size-full min-h-dvh max-w-3xl flex-col md:px-2">
            <div className="flex-1 flex flex-col px-4 max-w-3xl mx-auto w-full pt-1">
                <Conversation className="h-full px-10">
                    <ConversationContent 
                    className="overflow-hidden"
                    >
                        {messages.map((message) => {
                            const textParts = message.parts.filter((p) => p.type === "text");
                            return (
                                <MessageBranch defaultBranch={0} key={message.id}>
                                    <MessageBranchContent>
                                        {textParts.map((part, i) => (
                                            <Message
                                                from={message.role}
                                                key={`${message.id}-${i}`}
                                            >
                                                <MessageContent>
                                                    <MessageResponse>{(part as { text: string }).text}</MessageResponse>
                                                </MessageContent>
                                            </Message>
                                        ))}
                                    </MessageBranchContent>
                                    {textParts.length > 1 && (
                                        <MessageBranchSelector from={message.role}>
                                            <MessageBranchPrevious />
                                            <MessageBranchPage />
                                            <MessageBranchNext />
                                        </MessageBranchSelector>
                                    )}
                                </MessageBranch>
                            );
                        })}
                        {(status === "submitted" || status === "streaming") && <Loader />}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <div className="sticky bottom-0 mx-auto w-full pt-6 z-[5]">
                    {/* <ButtonScrollDown containerRef={window.document} /> */}
                    <Suggestions className="px-4 overflow-auto">
                        {suggestions.map((suggestion) => (
                            <Suggestion
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                suggestion={suggestion}
                            />
                        ))}
                    </Suggestions>
                    <div className="bg-white w-full px-4 pb-4">
                        <div className="mb-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/upload">Upload documents</Link>
                            </Button>
                        </div>
                        <PromptInput onSubmit={handleSubmit}>
                            <PromptInputBody>
                                <PromptInputTextarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                            </PromptInputBody>
                            <PromptInputFooter>
                                <PromptInputTools />
                                <PromptInputSubmit
                                    disabled={!text.trim() && status !== "submitted" && status !== "streaming"}
                                    status={status}
                                />
                            </PromptInputFooter>
                        </PromptInput>
                    </div>
                </div>
            </div>
        </div>
    );
}
