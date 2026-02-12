import { getServerSession } from "next-auth";
import { authConfig, loginRequiredServer } from "@/lib/auth";
import UploadClient from "./UploadClient";



const UploadPage = async () => {
    await loginRequiredServer();
    const session = await getServerSession(authConfig);
    console.log(session);

    return <UploadClient />

};



export default UploadPage;
