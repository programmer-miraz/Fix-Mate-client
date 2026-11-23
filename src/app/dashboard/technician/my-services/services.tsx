import { getMyServices } from "@/lib/api/get-services";
import type { useSession } from "@/lib/auth-client";

type Props = {
    session: NonNullable<ReturnType<typeof useSession>["data"]>;
};

const Services = async ({ session }: Props) => {
    const userID = session?.user?.id;
     await getMyServices(userID)

    return (
        <div>
            <p>User ID: {userID}</p>
        </div>
    );
};

export default Services;