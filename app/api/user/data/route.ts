import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Fetch all blob URLs before deleting DB records
  const documents = await prisma.document.findMany({
    where: { userId },
    select: { filePath: true },
  });

  // Delete blobs from Vercel Blob storage (best-effort)
  await Promise.allSettled(documents.map((doc) => del(doc.filePath)));

  // Delete all documents (cascades to DocumentChunk) and chat sessions (cascades to Message)
  await Promise.all([
    prisma.document.deleteMany({ where: { userId } }),
    prisma.chatSession.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ success: true });
}
