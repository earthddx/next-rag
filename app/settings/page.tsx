import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/custom/settings-client";

export default async function SettingsPage() {
    const session = await getServerSession(authConfig);
    if (!session?.user) redirect("/");

    const userId = (session.user as any).id as string;

    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true, password: true },
    });

    return (
        <SettingsClient
            userName={dbUser?.name}
            userEmail={dbUser?.email}
            userImageSrc={dbUser?.image}
            hasPassword={!!dbUser?.password}
        />
    );
}
