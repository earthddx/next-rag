import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

// POST /api/sessions/[sessionId]/messages - Save messages to a session
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    const { messages } = await req.json();

    // Verify session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id }
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get existing message IDs to avoid duplicates
    const existingMessages = await prisma.message.findMany({
      where: { sessionId },
      select: { id: true }
    });
    const existingIds = new Set(existingMessages.map(m => m.id));

    // Filter out messages that already exist
    const newMessages = messages.filter((msg: any) => !existingIds.has(msg.id));

    if (newMessages.length > 0) {
      // Save new messages
      await prisma.message.createMany({
        data: newMessages.map((msg: any) => ({
          id: msg.id,
          sessionId,
          role: msg.role,
          content: msg.parts
            ?.filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('') || '',
          metadata: msg.metadata || undefined
        })),
        skipDuplicates: true
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

      console.log(`💾 Saved ${newMessages.length} messages to session ${sessionId}`);
    }

    return NextResponse.json({ success: true, saved: newMessages.length });
  } catch (error) {
    console.error("Error saving messages:", error);
    return NextResponse.json(
      { error: "Failed to save messages" },
      { status: 500 }
    );
  }
}
