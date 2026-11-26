import { ServiceData } from "@/app/dashboard/technician/add-services/type";
import { MyService } from "@/app/dashboard/technician/my-services/services";

// Use the project's existing backend URL. NEXT_PUBLIC_BETTER_AUTH already points
// to the Express server, so it is used as a fallback when the other variable is absent.
const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH

export const createService = async (data: ServiceData) => {
    const res = await fetch(`${BASE_URL}/services`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Could not save the service. Please try again.");
    }

    return res.json();
};


// Technician: turn a service availability ON / OFF
export const updateServiceAvailability = async (
    serviceId: string,
    isAvailable: boolean
) => {
    const res = await fetch(`${BASE_URL}/services/${serviceId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable }),
    });

    if (!res.ok) {
        throw new Error("Could not update availability.");
    }

    return res.json();
};


/// Edit my-services
export const updateService = async (
    serviceId: string,
    data: Partial<MyService>
) => {
    const res = await fetch(`${BASE_URL}/services/${serviceId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...data,
            approvalStatus: "pending",
        }),
    });

    if (!res.ok) {
        throw new Error("Could not update service.");
    }

    return res.json();
};

/// Technician: Delete own service
export const deleteService = async (serviceId: string) => {
    const res = await fetch(`${BASE_URL}/services/${serviceId}`, {
        method: "DELETE",
    });

    return res.json();
};

// customer bookings 
export const createBooking = async (bookingData: object) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    });

    return res.json();
};


// Technician: move a booking to the next status (and optionally set final amount)
export const updateBookingStatus = async (
    bookingId: string,
    data: { status: string; finalAmount?: number }
) => {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to update booking.");
    }

    return res.json();
};

//customer request cencel korte parbe 

export const cancelBooking = async (bookingId: string, email: string) => {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        throw new Error("Failed to cancel booking");
    }

    return res.json();
};