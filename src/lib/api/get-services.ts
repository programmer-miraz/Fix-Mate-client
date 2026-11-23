
const BASE_URL =process.env.NEXT_PUBLIC_BETTER_AUTH

// Technicain my-services 
export const getMyServices = async (userId: string) => {
    const res = await fetch(`${BASE_URL}/my-services/${userId}`);
    return res.json();
};

// Technician: turn a service availability ON / OFF
export const updateServiceAvailability = async (
    serviceId: string,
    isAvailable: boolean
) => {
    const res = await fetch(`${BASE_URL}/services/${serviceId}/availability`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable }),
    });

    if (!res.ok) {
        throw new Error("Could not update service availability.");
    }

    return res.json();
};
