import "../globals.css";
import Toolbar from "@/components/custom/Toolbar";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authConfig);
    console.log(session)
    return (
        <div className="chat-layout-wrapper">
            <Toolbar userName={session?.user?.name} userImageSrc={session?.user?.image} />
            {children}
        </div>
    );
}
