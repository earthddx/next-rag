import { getServerSession } from "next-auth";
import { authConfig, loginRequiredServer } from "@/lib/auth";
import Chat from "@/components/custom/chat-component";
import Toolbar from "@/components/custom/Toolbar";



const ChatPage = async () => {
    await loginRequiredServer();
    const session = await getServerSession(authConfig);

    return <div>
        <Toolbar userName={session?.user?.name} userImageSrc={session?.user?.image} />
        <Chat />
    </div>
};



export default ChatPage;
