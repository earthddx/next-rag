import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id as string;
  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      filePath: true,
      status: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json({ documents });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id as string;
  const { id } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, error: "Document ID is required" },
      { status: 400 }
    );
  }

  // Verify the document belongs to the current user
  const document = await prisma.document.findFirst({
    where: { id, userId },
  });

  if (!document) {
    return NextResponse.json(
      { success: false, error: "Document not found" },
      { status: 404 }
    );
  }

  // Delete blob file from storage
  try {
    await del(document.filePath);
  } catch {
    // Blob may already be deleted; continue with DB cleanup
  }

  // Delete document and its chunks (cascade)
  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
