"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarCheck2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getCustomerBookings } from "@/lib/api/get-services";
import { useSession } from "@/lib/auth-client";
import { cancelBooking } from "@/lib/mutions-api/services";
import { cn } from "@/lib/utils";
import BookingCard from "./booking-card";

import type { CustomerBooking } from "./booking-card";

type CancelResult = {
    success?: boolean;
    message?: string;
};

const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "to-pay", label: "To pay" },
    { key: "paid", label: "Paid" },
    { key: "closed", label: "Closed" },
];

// Simple client-side filter logic - no extra API requests on tab change.
function matchesFilter(booking: CustomerBooking, key: string) {
    if (key === "all") return true;
    if (key === "active")
        return ["requested", "accepted", "in-progress"].includes(booking.status);
    if (key === "to-pay")
        return booking.status === "completed" && booking.paymentStatus !== "paid";
    if (key === "paid") return booking.paymentStatus === "paid";
    if (key === "closed")
        return booking.status === "rejected" || booking.status === "cancelled";
    return true;
}

export default function BookingsContent() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;

    // null = booking data has not arrived yet. Session + API share one loading UI.
    const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const loadBookings = useCallback(
        async (userEmail: string) => {
            try {
                const result = await getCustomerBookings(userEmail);
                setBookings(
                    Array.isArray(result) ? (result as CustomerBooking[]) : []
                );
                setErrorMessage("");
            } catch {
                setBookings([]);
                setErrorMessage("Could not load your bookings. Please try again.");
            }
        },
        []
    );

    useEffect(() => {
        if (isPending || !email) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBookings(email);
    }, [isPending, email, loadBookings]);

    async function handleCancel() {
        if (!cancelTarget || !email || isCancelling) return;
        setIsCancelling(true);

        try {
            const result = (await cancelBooking(
                cancelTarget._id,
                email
            )) as CancelResult;

            if (!result || result.success !== true) {
                throw new Error(result?.message || "Could not cancel the booking.");
            }

            toast.success("Booking request cancelled.");
            setCancelTarget(null);
            await loadBookings(email); // status refresh -> cancel button disappears
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not cancel the booking. Please try again."
            );
            // Dialog stays open so the customer can retry.
        } finally {
            setIsCancelling(false);
        }
    }

    const isLoading = isPending || bookings === null;
    const allBookings = bookings ?? [];
    const visibleBookings = allBookings.filter((booking) =>
        matchesFilter(booking, activeFilter)
    );

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header + filter tabs */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        My bookings
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Track each repair from request to payment.
                    </p>
                </div>

                <div className="flex flex-wrap gap-1 rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
                    {filterTabs.map((tab) => {
                        const count = allBookings.filter((booking) =>
                            matchesFilter(booking, tab.key)
                        ).length;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveFilter(tab.key)}
                                className={cn(
                                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                                    activeFilter === tab.key
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                                        : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                )}
                            >
                                {tab.label} <span className="opacity-75">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-40 animate-pulse rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load your bookings
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => email && loadBookings(email)}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty (no bookings at all) */}
            {!isLoading && !errorMessage && allBookings.length === 0 && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                        <CalendarCheck2 className="size-8" />
                    </span>
                    <p className="mt-5 text-lg font-semibold text-slate-900">
                        No bookings yet
                    </p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                        Book a repair service and your requests will appear here.
                    </p>
                    <Link
                        href="/services"
                        className="mt-6 inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                    >
                        Browse services
                    </Link>
                </div>
            )}

            {/* Filter empty */}
            {!isLoading &&
                !errorMessage &&
                allBookings.length > 0 &&
                visibleBookings.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-lg shadow-blue-900/5">
                        <p className="font-semibold text-slate-900">
                            No bookings in this filter
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Try another tab to see your other requests.
                        </p>
                    </div>
                )}

            {/* Booking cards */}
            {!isLoading && !errorMessage && visibleBookings.length > 0 && (
                <div className="mt-6 space-y-4">
                    {visibleBookings.map((booking) => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                            onCancel={() => setCancelTarget(booking)}
                            isCancelling={isCancelling && cancelTarget?._id === booking._id}
                        />
                    ))}
                </div>
            )}

            {/* Cancel confirmation */}
            <Dialog
                open={Boolean(cancelTarget)}
                onOpenChange={(open) => !open && !isCancelling && setCancelTarget(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel this request?</DialogTitle>
                        <DialogDescription>
                            This will cancel your repair request. You can book the service
                            again later if you change your mind.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCancelTarget(null)}
                            disabled={isCancelling}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                            Keep request
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="h-10 cursor-pointer rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {isCancelling ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Cancel request"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
