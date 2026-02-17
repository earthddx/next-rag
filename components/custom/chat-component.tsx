"use client";

import React from "react";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ChatStatus, UIDataTypes, UIMessage, UITools } from "ai";
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
	type PromptInputMessage,
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

type PdfMetadata = {
	isPdfUpload?: boolean;
	fileUrl?: string;
	fileName?: string;
};


export default function Chat() {
	const [input, setInput] = React.useState("");
	const [isProcessingPdf, setIsProcessingPdf] = React.useState(false);
	const [previewPdf, setPreviewPdf] = React.useState<{ url: string; fileName: string } | null>(null);

	const { messages, sendMessage, setMessages, status, sessionId, isLoadingSession, isStreaming, isReady, createNewSession } = useChatSession();

	const isLoading = status === "streaming" || status === "submitted" || isProcessingPdf || isLoadingSession || isStreaming;
	const canSendMessage = isReady && !isLoading;

	const handleSuggestionClick = (suggestion: string) => {
		sendMessage({ text: suggestion });
	};

	const handleSubmit = async (message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Handle PDF file uploads
		if (message.files && message.files.length > 0) {
			setIsProcessingPdf(true);

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
					formData.set("pdf", file);

					// Call the API route directly
					const response = await fetch('/api/upload', {
						method: 'POST',
						body: formData,
					});

					const result = await response.json();

					if (result.success) {
						toast.success("PDF Processed", {
							description: `Successfully processed ${fileName}. ${result.chunksCreated} chunks created.`,
						});

						const assistantMessage: UIMessage = {
							id: crypto.randomUUID(),
							role: "assistant" as const,
							parts: [{
								type: "text" as const,
								text: `✅ Successfully processed ${fileName} (${result.chunksCreated} chunks created)`
							}],
							// Store fileUrl in metadata for preview
							metadata: {
								fileUrl: result.fileUrl,
								fileName: fileName,
								isPdfUpload: true
							}
						};
						setMessages((prev: UIMessage[]) => [...prev, assistantMessage]);
					} else {
						toast.error("Upload Failed", {
							description: result.error ?? "Failed to process PDF.",
						});

						const errorMessage: UIMessage = {
							id: crypto.randomUUID(),
							role: "assistant" as const,
							parts: [{
								type: "text" as const,
								text: `❌ Failed to process ${fileName}: ${result.error || 'Unknown error'}`
							}],
						};
						setMessages((prev: UIMessage[]) => [...prev, errorMessage]);
					}
				} catch (error) {
					console.error("Error converting or processing file:", error);
					toast.error("Error", {
						description: "Failed to process the PDF file.",
					});

					const errorMessage: UIMessage = {
						id: crypto.randomUUID(),
						role: "assistant" as const,
						parts: [{
							type: "text" as const,
							text: `❌ Error processing ${fileName}`
						}],
					};
					setMessages((prev: UIMessage[]) => [...prev, errorMessage]);
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
			<ConversationComponent
				messages={messages}
				isLoadingSession={isLoadingSession}
				isProcessingPdf={isProcessingPdf}
				isStreaming={isStreaming}
				setPreviewPdf={setPreviewPdf}
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
					<PromptInput
						accept="application/pdf,.pdf"
						onSubmit={handleSubmit}
						className="flex gap-2 items-end"
					>
						<AttachmentsPreview />
						<PromptInputTextarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={isLoadingSession ? "Loading session..." : "Type your message or upload a PDF..."}
							disabled={!canSendMessage}
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
							<PromptInputSubmit disabled={!canSendMessage} />
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
			<PdfPreview
				previewPdf={previewPdf}
				setPreviewPdf={setPreviewPdf}
			/>
		</div>
	);
}

const PdfPreview = ({ previewPdf, setPreviewPdf }: {
	previewPdf: {
		url: string;
		fileName: string;
	} | null, setPreviewPdf: React.Dispatch<React.SetStateAction<{
		url: string;
		fileName: string;
	} | null>>
}) => {
	return <Dialog open={!!previewPdf} onOpenChange={(open) => !open && setPreviewPdf(null)}>
		<DialogContent className="sm:max-w-3xl md:max-w-5xl  flex flex-col h-[90vh]">
			<DialogHeader>
				<DialogTitle>{previewPdf?.fileName || "PDF Preview"}</DialogTitle>
			</DialogHeader>
			<div className="flex-1 min-h-0">
				{previewPdf && (
					<iframe
						src={previewPdf.url}
						className="w-full h-full border-0 rounded"
						title={previewPdf.fileName}
					/>
				)}
			</div>
		</DialogContent>
	</Dialog>
}

const ConversationComponent = ({ messages, isLoadingSession, isProcessingPdf, isStreaming, setPreviewPdf, status }: {
	messages: UIMessage<unknown, UIDataTypes, UITools>[],
	isLoadingSession: boolean,
	isProcessingPdf: boolean,
	isStreaming: boolean,
	setPreviewPdf: React.Dispatch<React.SetStateAction<{
		url: string;
		fileName: string;
	} | null>>,
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
					description="Type a message or upload a PDF to begin"
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
									{/* Show preview button for PDF uploads */}
									{(() => {
										const metadata = message.metadata as PdfMetadata;
										return metadata?.isPdfUpload && metadata?.fileUrl && (
											<button
												onClick={() => setPreviewPdf({
													url: metadata.fileUrl!,
													fileName: metadata.fileName!
												})}
												className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
											>
												<FileTextIcon className="size-4" />
												View PDF
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
			{(status === "submitted" || status === "streaming" || isProcessingPdf || isStreaming) && <Loader />}
		</ConversationContent>
		<ConversationScrollButton />
	</Conversation>
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

const dataURItoFile = async (dataURI: string, filename: string): Promise<File> => {
	const response = await fetch(dataURI);
	const blob = await response.blob();
	return new File([blob], filename, { type: blob.type });
}