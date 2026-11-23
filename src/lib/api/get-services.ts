
const BASE_URL =process.env.NEXT_PUBLIC_BETTER_AUTH

// Technicain my-services 
export const getMyServices = async (userId: string) => {
    const res = await fetch(`${BASE_URL}/my-services/${userId}`);
    return res.json();
};