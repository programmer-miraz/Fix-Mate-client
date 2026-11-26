import { MyService } from "@/app/dashboard/technician/my-services/services";

const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH

// Technicain my-services 
export const getMyServices = async (userId: string) => {
    const res = await fetch(`${BASE_URL}/my-services/${userId}`);
    return res.json();
};


/// customer get all services cart home services page
export const customerServices = async (query: string = "") => {
    const res = await fetch(`${BASE_URL}/services?${query}`);
    return res.json();
};

// Public service details page: fetch one service by its MongoDB _id.
export const getServiceById = async (serviceId: string) => {
    const res = await fetch(`${BASE_URL}/services/${serviceId}`);
    return res.json();
};

// get requests
export const getTechnicianBookings = async (email: string) => {
    const res = await fetch(
        `${BASE_URL}/bookings?technicianEmail=${email}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch bookings");
    }

    return res.json();
};
/// get customer my-booking=page

