import { useSession } from "@/lib/auth-client";
import Services from "./services";

const Myservices_page = () => {
    const { data: session,isPending } = useSession();

    if (!session) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Services session={session} />
        </div>
    );
};

export default Myservices_page;