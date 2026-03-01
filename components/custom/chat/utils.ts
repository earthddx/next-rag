import { UploadEvent } from "./types";

export const dataURItoFile = async (dataURI: string, filename: string): Promise<File> => {
    const response = await fetch(dataURI);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

export const readUploadStream = async (
    body: ReadableStream<Uint8Array>,
    onProgress: (progress: number) => void,
    onLabel: (label: string) => void,
): Promise<any> => {
    const reader = body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let event: UploadEvent;
            try {
                event = JSON.parse(line.slice(6));
            } catch (e) {
                console.warn("Skipping malformed SSE line:", line, e);
                continue;
            }

            if (event.error) {
                throw new Error(event.error);
            }
            if (event.progress !== undefined) {
                onProgress(event.progress);
            }
            if (event.label) {
                onLabel(event.label);
            }
            if (event.result) {
                return event.result;
            }
        }
    }
}