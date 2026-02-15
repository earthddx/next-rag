-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileData" BYTEA;

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_chunkIndex_idx" ON "DocumentChunk"("documentId", "chunkIndex");
