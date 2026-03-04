import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Only JPEG, PNG, WebP or GIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Image must be under 2 MB" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const blob = await put(`avatars/${userId}/${Date.now()}.${ext}`, buffer, {
        access: "public",
        contentType: file.type,
    });

    // Delete old avatar if it was previously stored in our blob (best-effort)
    const existing = await prisma.user.findUnique({ where: { id: userId }, select: { image: true } });
    if (existing?.image?.includes("blob.vercel-storage.com")) {
        await del(existing.image).catch(() => null);
    }

    await prisma.user.update({ where: { id: userId }, data: { image: blob.url } });

    return NextResponse.json({ image: blob.url });
}
