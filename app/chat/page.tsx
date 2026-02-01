
import { getServerSession } from "next-auth";
import { authConfig, loginRequiredServer } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatContent from "@/components/custom/ChatContent";



const ChatPage = async () => {
    await loginRequiredServer();
    const session = await getServerSession(authConfig);
    console.log(session)

    return <ChatContent />
};



export default ChatPage;
