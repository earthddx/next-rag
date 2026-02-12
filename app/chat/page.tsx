import { getServerSession } from "next-auth";
import { authConfig, loginRequiredServer } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatContent from "@/components/custom/ChatContent";
import RAGChatBot from "@/components/custom/RagChat";



const ChatPage = async () => {
    await loginRequiredServer();
    const session = await getServerSession(authConfig);
    console.log(session);

    return <RAGChatBot />

    // return <ChatContent />
};



export default ChatPage;
