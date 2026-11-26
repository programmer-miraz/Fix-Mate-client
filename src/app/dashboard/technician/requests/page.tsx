"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    Loader2,
    MapPin,
    Phone,
    UserRound,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import {

    updateBookingStatus,
} from "@/lib/mutions-api/services";
import { cn } from "@/lib/utils";
import { getTechnicianBookings } from "@/lib/api/get-services";
import { useRouter } from "next/navigation";

// Fields stored in the bookings collection by the customer booking form.
type Booking = {
    _id: string;
    serviceId: string;
    serviceTitle: string;
    serviceImage: string;
    category: string;
    basePrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    preferredDate: string;
    problemDescription: string;
    status: string;
    finalAmount: number;
    paymentStatus: string;
    createdAt: string;
};

type UpdateResult = {
    success: boolean;
    message: string;
};
const statusTabs = [
    { key: "all", label: "All" },
    { key: "requested", label: "Requested" },
    { key: "accepted", label: "Accepted" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" },
];

function formatDate(value?: string) {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not set";
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatPrice(value: number) {
    return Number.isFinite(value) ? `$${value.toFixed(2)}` : "$0.00";
}

function statusStyle(status: string) {
    if (status === "accepted") return "border border-blue-200 bg-blue-50 text-blue-700";
    if (status === "in-progress") return "border border-cyan-200 bg-cyan-50 text-cyan-700";
    if (status === "completed") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "rejected" || status === "cancelled")
        return "border border-red-200 bg-red-50 text-red-700";
    return "border border-amber-200 bg-amber-50 text-amber-700";
}

function statusLabel(status: string) {
    if (status === "in-progress") return "In progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function RequestesPage() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;


    // null = bookings have not arrived yet. One flag covers session + API loading.
    const [bookings, setBookings] = useState<Booking[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [updatingId, setUpdatingId] = useState("");

    // Dialogs: reject confirmation and complete-with-amount form.
    const [rejectBooking, setRejectBooking] = useState<Booking | null>(null);
    const [completeBooking, setCompleteBooking] = useState<Booking | null>(null);
    const [finalAmount, setFinalAmount] = useState("");



    // Fetch after the session is ready; all state updates happen after the await.
    const loadBookings = useCallback(
        async (userEmail: string) => {
            try {
                const result = await getTechnicianBookings(userEmail);
                setBookings(Array.isArray(result) ? (result as Booking[]) : []);
                setErrorMessage("");
            } catch {
                setBookings([]);
                setErrorMessage("Could not load your requests. Please try again.");
            }
        },
        []
    );

    useEffect(() => {
        if (isPending || !email) return;
        // Fetch once the session is ready; all state updates happen after the await.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBookings(email);
    }, [isPending, email, loadBookings]);

    // One loading UI for the whole process: session check + booking fetch.
    const isLoading = isPending || bookings === null;
    const allBookings = bookings ?? [];

   async function changeStatus(booking: Booking, nextStatus: string, amount?: number) {
    if (updatingId) return;

    setUpdatingId(booking._id);

    try {
        const result = await updateBookingStatus(booking._id, {
            status: nextStatus,
            ...(amount !== undefined ? { finalAmount: amount } : {}),
        }) as UpdateResult;

        if (!result || result.success !== true) {
            throw new Error(result?.message || "Update failed.");
        }

        toast.success(`Booking marked ${statusLabel(nextStatus).toLowerCase()}.`);

        setRejectBooking(null);
        setCompleteBooking(null);

        if (email) {
            await loadBookings(email);
        }
    } catch (error) {
        toast.error(
            error instanceof Error ? error.message : "Could not update the booking."
        );
    } finally {
        setUpdatingId("");
    }
}

    function openCompleteDialog(booking: Booking) {
        setFinalAmount(String(booking.basePrice ?? 0)); // default = service price
        setCompleteBooking(booking);
    }

    const visibleBookings =
        activeTab === "all"
            ? allBookings
            : allBookings.filter((booking) => booking.status === activeTab);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header + tabs */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Manage requests
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Move each job forward one step at a time.
                    </p>
                </div>

                <div className="flex flex-wrap gap-1 rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
                    {statusTabs.map((tab) => {
                        const count =
                            tab.key === "all"
                                ? allBookings.length
                                : allBookings.filter((b) => b.status === tab.key).length;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                                    activeTab === tab.key
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
                <div className="mt-8 flex items-center justify-center rounded-2xl border border-blue-100 bg-white py-16 shadow-lg shadow-blue-900/5">
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                    <span className="ml-3 text-sm text-slate-500">
                        Loading requests...
                    </span>
                </div>
            )}

            {/* Error */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load requests
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

            {/* Empty */}
            {!isLoading && !errorMessage && visibleBookings.length === 0 && (
                <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <UserRound className="mx-auto size-10 text-blue-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        No requests here yet
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        New repair requests will appear here as customers book your services.
                    </p>
                </div>
            )}

            {/* Booking cards */}
            {!isLoading && !errorMessage && visibleBookings.length > 0 && (
                <div className="mt-6 space-y-4">
                    {visibleBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5 transition hover:shadow-xl hover:shadow-blue-900/10 md:flex-row"
                        >
                            {/* Left: booking details */}
                            <div className="min-w-0 flex-1 p-5">
                                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                    {booking.serviceTitle || "Repair service"}
                                </h2>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                    <CalendarDays className="size-3.5" />
                                    Requested {formatDate(booking.createdAt)}, preferred{" "}
                                    {formatDate(booking.preferredDate)}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                                    <p>
                                        Customer:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {booking.customerName || "Not provided"}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-blue-500" />
                                        Phone:{" "}
                                        <span className="font-semibold text-slate-800">
                                            {booking.customerPhone || "Not provided"}
                                        </span>
                                    </p>
                                </div>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                    <MapPin className="size-3.5 shrink-0 text-blue-500" />
                                    Address:{" "}
                                    <span className="font-semibold text-slate-800">
                                        {booking.address || "Not provided"}
                                    </span>
                                </p>

                                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                                    {booking.problemDescription || "No description provided."}
                                </p>
                            </div>

                            {/* Right: ticket, price and actions */}
                            <div className="flex w-full shrink-0 flex-col border-t border-blue-50 p-5 md:w-56 md:border-l md:border-t-0">
                                <div className="max-sm:flex max-sm:gap-3.5 max-sm:justify-between">

                                    {booking.serviceId && (
                                        <p className="text-xs text-slate-400">
                                            Ticket #{booking.serviceId.slice(0, 6)}
                                        </p>
                                    )}
                                    <div className="flex gap-2">


                                        <span
                                            className={cn(
                                                "sm:mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                statusStyle(booking.status)

                                            )}
                                        >
                                            {statusLabel(booking.status)}

                                        </span>
                                        <span
                                            className={cn(
                                                "sm:mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                statusStyle(booking.paymentStatus)
                                            )}
                                        >
                                            {statusLabel(booking.paymentStatus)}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-3 text-2xl font-bold text-slate-900">
                                    {formatPrice(Number(booking.basePrice))}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 md:mt-auto">
                                    {booking.status === "requested" && (
                                        <>
                                            <Button
                                                type="button"
                                                   disabled={updatingId === booking._id}
                                                onClick={() =>
                                                    changeStatus(booking, "accepted")
                                                }
                                                className="h-9 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                                            >
                                                  {updatingId === booking._id ? "Accepting..." : "Accept"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={Boolean(updatingId)}
                                                onClick={() => setRejectBooking(booking)}
                                                className="h-9 cursor-pointer rounded-lg border-blue-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 disabled:opacity-50"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {booking.status === "accepted" && (
                                        <Button
                                            type="button"
                                            disabled={Boolean(updatingId)}
                                            onClick={() =>
                                                changeStatus(booking, "in-progress")
                                            }
                                            className="h-9 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                                        >
                                               {updatingId === booking._id ? "Starting..." : "Start Work"}
                                        </Button>
                                    )}

                                    {booking.status === "in-progress" && (
                                        <Button
                                            type="button"
                                            disabled={Boolean(updatingId)}
                                            onClick={() => openCompleteDialog(booking)}
                                            className="h-9 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                                        >
                                         
                                            Mark Completed
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject confirmation */}
            <Dialog
                open={Boolean(rejectBooking)}
                onOpenChange={(open) => !open && setRejectBooking(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject this request?</DialogTitle>
                        <DialogDescription>
                            This will mark the booking as rejected. The customer will not be
                            able to continue with this request.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRejectBooking(null)}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 hover:bg-blue-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={Boolean(updatingId) || !rejectBooking}
                            onClick={() =>
                                rejectBooking && changeStatus(rejectBooking, "rejected")
                            }
                            className="h-10 cursor-pointer rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {updatingId ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Reject Booking"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Mark completed with final amount */}
            <Dialog
                open={Boolean(completeBooking)}
                onOpenChange={(open) => !open && setCompleteBooking(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark as completed</DialogTitle>
                        <DialogDescription>
                            Confirm the final amount for this repair.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5">
                        <Label htmlFor="finalAmount">Final amount (USD)</Label>
                        <Input
                            id="finalAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={finalAmount}
                            onChange={(event) => setFinalAmount(event.target.value)}
                            className="mt-1.5"
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCompleteBooking(null)}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 hover:bg-blue-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={Boolean(updatingId) || !completeBooking}
                            onClick={() => {
                                if (!completeBooking) return;
                                const amount = Number(finalAmount);
                                if (!Number.isFinite(amount) || amount < 0) {
                                    toast.error("Please enter a valid final amount.");
                                    return;
                                }
                                changeStatus(completeBooking, "completed", amount);
                            }}
                            className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                        >
                            {updatingId ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Mark Completed"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
