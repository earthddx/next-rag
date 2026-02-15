import { loginRequiredServer } from "@/lib/auth";
import UploadClient from "@/components/custom/upload-client";



const UploadPage = async () => {
    await loginRequiredServer();

    return <UploadClient />

};



export default UploadPage;
