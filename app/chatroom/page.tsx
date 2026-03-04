import { getServerSession } from "next-auth";
import { authConfig, loginRequiredServer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Chat from "@/components/custom/chat";
import Toolbar from "@/components/custom/Toolbar";

const ChatPage = async () => {
    await loginRequiredServer();
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id as string;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true, email: true },
    });

    return <div>
        <Toolbar userName={user?.name} userImageSrc={user?.image} userEmail={user?.email} />
        <Chat />
    </div>
};



export default ChatPage;
