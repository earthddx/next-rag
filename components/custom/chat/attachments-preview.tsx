"use client";

import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import {
    Attachments,
    Attachment,
    AttachmentPreview,
    AttachmentInfo,
    AttachmentRemove,
} from "@/components/ai-elements/attachments";
import { FileTextIcon } from "lucide-react";

export default () => {
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