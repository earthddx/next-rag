"use client";

import React from "react";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { toast } from "sonner";
import type { UIMessage } from "ai";
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
	type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Progress } from "@/components/ui/progress";
import ConversationComponent from "./conversation";
import AttachmentsPreview from "./attachments-preview";
import FilePreview from "./file-preview";
import { PreviewFile } from "./types";
import { dataURItoFile, readUploadStream } from "./utils";

const suggestions = [
	"What documents have been uploaded?",
	"Summarize the key points from my documents",
	"Search for specific information in my files",
	"What are the main topics in my documents?",
];


export default function Chat() {
	const [input, setInput] = React.useState("");
	const [isProcessingFile, setProcessingFile] = React.useState(false);
	const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
	const [uploadLabel, setUploadLabel] = React.useState("");
	const [previewFile, setPreviewFile] = React.useState<PreviewFile | null>(null);

	const { messages, sendMessage, setMessages, status, sessionId, isLoadingSession, isStreaming, isReady, createNewSession } = useChatSession();

	const isLoading = status === "streaming" || status === "submitted" || isProcessingFile || isLoadingSession || isStreaming;
	const canSendMessage = isReady && !isLoading;

	const handleSuggestionClick = (suggestion: string) => {
		sendMessage({ text: suggestion });
	};

	const handleSubmit = async (message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Handle PDF file uploads
		if (message.files && message.files.length > 0) {
			setProcessingFile(true);

			for (const fileData of message.files) {
				const fileName = fileData.filename || 'unknown.pdf';
				const userMessageText = message.text || `Uploading file: ${fileName}`;
				const userMessage: UIMessage = {
					id: crypto.randomUUID(),
					role: "user" as const,
					parts: [{ type: "text" as const, text: userMessageText }],
				};
				setMessages((prev: UIMessage[]) => [...prev, userMessage]);

				try {
					// Convert base64 data URI to File object
					const file = await dataURItoFile(fileData.url, fileName);

					const formData = new FormData();
					formData.set("file", file);

					// Stream progress events from the server
					setUploadProgress(0);
					setUploadLabel("Starting…");

					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData
					});

					// Validation errors come back as plain JSON
					if (!response.headers.get("content-type")?.includes("text/event-stream")) {
						const json = await response.json();
						throw new Error(json.error ?? "Upload failed");
					}

					const finalResult = await readUploadStream(
						response.body!,
						setUploadProgress,
						setUploadLabel,
					);

					setUploadProgress(null);

					if (finalResult?.success) {
						toast.success("Document Processed", {
							description: `Successfully processed ${fileName}. ${finalResult.chunksCreated} chunks created.`,
						});
						const assistantMessage: UIMessage = {
							id: crypto.randomUUID(),
							role: "assistant" as const,
							parts: [{
								type: "text" as const,
								text: `✅ Successfully processed ${fileName} (${finalResult.chunksCreated} chunks created)`
							}],
							// Store fileUrl in metadata for preview
							metadata: {
								fileUrl: finalResult.fileUrl,
								fileName,
								isPdfUpload: true,
								fileType: file.type,
							},
						};
						setMessages((prev: UIMessage[]) => [...prev, assistantMessage]);
						if (sessionId) {
							await fetch(`/api/sessions/${sessionId}/messages`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ messages: [userMessage, assistantMessage] }),
							});
						}
					} else {
						throw new Error("Processing finished without a result");
					}
				} catch (error) {
					setUploadProgress(null);
					console.error("Error converting or processing file:", error);
					const msg = error instanceof Error ? error.message : "Failed to process the file.";
					toast.error("Upload Failed", { description: msg });
					const errorMessage: UIMessage = {
						id: crypto.randomUUID(),
						role: "assistant" as const,
						parts: [{
							type: "text" as const,
							text: `❌ Failed to process ${fileName}: ${msg}`
						}],
					};
					setMessages((prev: UIMessage[]) => [...prev, errorMessage]);
					if (sessionId) {
						await fetch(`/api/sessions/${sessionId}/messages`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ messages: [userMessage, errorMessage] }),
						});
					}
				}
			}

			setInput("");
			setProcessingFile(false);
		}
		// Handle text-only messages
		else if (message.text) {
			sendMessage({ text: message.text });
			setInput("");
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-6rem)]">
			<ConversationComponent
				messages={messages}
				isLoadingSession={isLoadingSession}
				isProcessingFile={isProcessingFile}
				isStreaming={isStreaming}
				setPreviewFile={setPreviewFile}
				status={status}
			/>
			<div className="border-t p-4">
				<Suggestions className="px-4 overflow-auto max-w-[400px] sm:max-w-3xl mx-auto">
					{suggestions.map((suggestion) => (
						<Suggestion
							key={suggestion}
							onClick={() => handleSuggestionClick(suggestion)}
							suggestion={suggestion}
						/>
					))}
				</Suggestions>
				<div className="max-w-3xl mx-auto">
					{uploadProgress !== null && (
						<div className="mb-2 space-y-1">
							<div className="flex items-center justify-between text-xs text-slate-400">
								<span>{uploadLabel}</span>
								<span>{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="h-1.5" />
						</div>
					)}
					<PromptInput
						accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc"
						onSubmit={handleSubmit}
						className="flex gap-2 items-end"
					>
						<AttachmentsPreview />
						<PromptInputTextarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={isLoadingSession ? "Loading session..." : "Type your message or upload a document (PDF, DOCX, DOC)..."}
							disabled={!canSendMessage}
							rows={1}
							className="flex-1"
						/>
						<PromptInputFooter>
							<PromptInputTools>
								<PromptInputActionMenu>
									<PromptInputActionMenuTrigger />
									<PromptInputActionMenuContent>
										<PromptInputActionAddAttachments label="Add document" />
									</PromptInputActionMenuContent>
								</PromptInputActionMenu>
							</PromptInputTools>
							<PromptInputSubmit disabled={!canSendMessage} />
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
			<FilePreview
				previewFile={previewFile}
				setPreviewFile={setPreviewFile}
			/>
		</div>
	);
}
