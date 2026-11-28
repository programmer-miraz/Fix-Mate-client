"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAllBookings } from "@/lib/api/get-services";
import { cn } from "@/lib/utils";

// Actual fields stored in the bookings collection by the booking form.
type AdminBooking = {
    _id: string;
    serviceTitle: string;
    category: string;
    customerName: string;
    technicianName: string;
    preferredDate: string;
    status: string;
    paymentStatus: string;
    basePrice: number;
    finalAmount: number;
    createdAt: string;
};

const statusTabs = [
    { key: "all", label: "All" },
    { key: "requested", label: "Requested" },
    { key: "accepted", label: "Accepted" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
    { key: "cancelled", label: "Cancelled" },
];

// Pending bookings are stored as "requested" in the database.
function matchesStatus(booking: AdminBooking, key: string) {
    if (key === "all") return true;
    if (key === "requested") {
        return booking.status === "requested" || booking.status === "pending";
    }
    return booking.status === key;
}

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

function formatAmount(booking: AdminBooking) {
    // finalAmount is only set when a repair is completed.
    const hasFinal =
        booking.status === "completed" &&
        Number.isFinite(booking.finalAmount) &&
        booking.finalAmount > 0;
    const amount = hasFinal ? booking.finalAmount : booking.basePrice;
    return `$${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

function ticketId(booking: AdminBooking) {
    return `#FM-${booking._id?.slice(-4) || "N/A"}`;
}

function statusStyle(status?: string) {
    switch (status) {
        case "requested":
        case "pending":
            return "border border-blue-200 bg-blue-50 text-blue-700";
        case "accepted":
            return "border border-indigo-200 bg-indigo-50 text-indigo-700";
        case "in-progress":
            return "border border-amber-200 bg-amber-50 text-amber-700";
        case "completed":
            return "border border-emerald-200 bg-emerald-50 text-emerald-700";
        case "rejected":
            return "border border-red-200 bg-red-50 text-red-700";
        case "cancelled":
            return "border border-slate-200 bg-slate-100 text-slate-600";
        default:
            return "border border-slate-200 bg-slate-50 text-slate-600";
    }
}

function statusLabel(status?: string) {
    if (!status) return "Requested";
    if (status === "pending") return "Requested";
    if (status === "in-progress") return "In progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AllBookingsContent() {
    const [bookings, setBookings] = useState<AdminBooking[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const loadBookings = useCallback(async () => {
        try {
            const result = await getAllBookings();
            setBookings(Array.isArray(result) ? (result as AdminBooking[]) : []);
        } catch {
            setBookings([]);
            setErrorMessage("Could not load bookings. Please try again.");
            toast.error("Could not load bookings. Please try again.");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBookings();
    }, [loadBookings]);

    const isLoading = bookings === null;
    const allBookings = bookings ?? [];

    const visibleBookings = allBookings.filter((booking) =>
        matchesStatus(booking, activeTab)
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    All bookings
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Every repair job on the platform. Read only.
                </p>
            </div>

            {/* Status tabs */}
            <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
                {statusTabs.map((tab) => {
                    const count = allBookings.filter((booking) =>
                        matchesStatus(booking, tab.key)
                    ).length;

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

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-14 w-full rounded-xl bg-blue-100/70"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load bookings
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            loadBookings();
                        }}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        <RefreshCw className="size-4" />
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !errorMessage && visibleBookings.length === 0 && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <CalendarDays className="size-9 text-blue-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        {activeTab === "all"
                            ? "No bookings yet"
                            : "No bookings in this status"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {activeTab === "all"
                            ? "Repair requests from customers will appear here."
                            : "Choose another tab to see other bookings."}
                    </p>
                </div>
            )}

            {/* Table */}
            {!isLoading && !errorMessage && visibleBookings.length > 0 && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[900px] text-sm">
                            <TableHeader className="border-b border-blue-100 bg-blue-50/60">
                                <TableRow>
                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Ticket</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Technician</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</TableHead>
                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-blue-50">
                                {visibleBookings.map((booking) => (
                                    <TableRow
                                        key={booking._id}
                                        className="transition hover:bg-blue-50/40"
                                    >
                                        <TableCell className="whitespace-nowrap px-5 py-3 font-medium text-slate-500">
                                            {ticketId(booking)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 font-semibold text-slate-800">
                                            {booking.serviceTitle || "Repair service"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-slate-600">
                                            {booking.customerName || "Not provided"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-slate-600">
                                            {booking.technicianName || "Not provided"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                                            {formatDate(booking.preferredDate || booking.createdAt)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                    statusStyle(booking.status)
                                                )}
                                            >
                                                {statusLabel(booking.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                    booking.paymentStatus === "paid"
                                                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border border-slate-200 bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                {booking.paymentStatus === "paid"
                                                    ? "Paid"
                                                    : "Unpaid"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-5 py-3 font-bold text-slate-900">
                                            {formatAmount(booking)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
