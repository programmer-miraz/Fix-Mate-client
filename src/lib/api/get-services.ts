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




// get customer my-booking=page
export const getCustomerBookings = async (email: string) => {
    const res = await fetch(`${BASE_URL}/bookings/my?email=${email}`);

    if (!res.ok) {
        throw new Error("Failed to fetch bookings");
    }

    return res.json();
};

// Get customer dashboard data
export const getCustomerDashboard = async (email: string) => {
    const res = await fetch(`${BASE_URL}/customer-dashboard/${email}`);
    return res.json();
};

//Get Technician dashboard page 
export const getTechnicianDashboard = async (email: string) => {
    const res = await fetch(
        `${BASE_URL}/technician-dashboard/${encodeURIComponent(email)}`
    );

    return res.json();
};

// Get admin users-page role api
export const getAllUsers = async () => {
    const res = await fetch(`${BASE_URL}/admin/users`);
    return res.json();
};

// Admin - Get all services-page
export const getAllServices = async () => {
    const res = await fetch(`${BASE_URL}/admin/services`);
    return res.json();
};

//Admin -get booking-page
export const getAllBookings = async () => {
    const res = await fetch(`${BASE_URL}/admin/bookings`);
    return res.json();
};

// Admin - Get all transactions-page
export const getAllTransactions = async () => {
    const res = await fetch(`${BASE_URL}/admin/transactions`);
    return res.json();
};