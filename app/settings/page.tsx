import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/custom/settings-client";

export default async function SettingsPage() {
    const session = await getServerSession(authConfig);
    if (!session?.user) redirect("/");

    const userId = (session.user as any).id as string;

    // Check if this user has a password (credentials-based account)
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
    });

    return (
        <SettingsClient
            userName={session.user.name}
            userEmail={session.user.email}
            userImageSrc={session.user.image}
            hasPassword={!!dbUser?.password}
        />
    );
}
