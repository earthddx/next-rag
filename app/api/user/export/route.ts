import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    const [user, chatSessions, documents] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true },
        }),
        prisma.chatSession.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        createdAt: true,
                    },
                },
            },
        }),
        prisma.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: "asc" },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                status: true,
                uploadedAt: true,
                processedAt: true,
            },
        }),
    ]);

    const payload = {
        exportedAt: new Date().toISOString(),
        user,
        chatSessions,
        documents,
    };

    const json = JSON.stringify(payload, null, 2);
    const filename = `chatdocs-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(json, {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
