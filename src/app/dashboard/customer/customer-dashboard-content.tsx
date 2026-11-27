"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    CalendarCheck2,
    Clock3,
    CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getCustomerBookings,
    getCustomerDashboard,
} from "@/lib/api/get-services";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// Shape returned by GET /customer-dashboard/:email.
type DashboardStats = {
    totalBookings?: number;
    pendingBookings?: number;
    completedBookings?: number;
};

// Fields used from the existing customer bookings API.
type RecentBooking = {
    _id: string;
    serviceTitle: string;
    serviceImage: string;
    category: string;
    technicianName: string;
    status: string;
    paymentStatus: string;
    finalAmount: number;
    basePrice: number;
    createdAt: string;
};

function safeNumber(value: number | undefined) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatAmount(value: number | undefined) {
    return `$${safeNumber(value).toFixed(2)}`;
}

function bookingBadgeStyle(status?: string) {
    if (status === "completed") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "confirmed" || status === "accepted")
        return "border border-blue-200 bg-blue-50 text-blue-700";
    if (status === "in-progress")
        return "border border-purple-200 bg-purple-50 text-purple-700";
    if (status === "cancelled" || status === "rejected")
        return "border border-red-200 bg-red-50 text-red-700";
    return "border border-amber-200 bg-amber-50 text-amber-700";
}

function bookingLabel(status?: string) {
    if (!status) return "Pending";
    if (status === "accepted") return "Confirmed";
    if (status === "in-progress") return "In progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function paymentBadgeStyle(status?: string) {
    if (status === "paid") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border border-orange-200 bg-orange-50 text-orange-700";
}

export default function CustomerDashboardContent() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;

    const [stats, setStats] = useState<DashboardStats | null>(null);
    // Full list is kept so the "In progress" count covers all bookings,
    // while the Recent section only shows the latest 5.
    const [customerBookings, setCustomerBookings] = useState<RecentBooking[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadDashboard = useCallback(
        async (userEmail: string) => {
            try {
                const [statsResult, bookingsResult] = await Promise.all([
                    getCustomerDashboard(userEmail),
                    getCustomerBookings(userEmail),
                ]);

                setStats(
                    statsResult && typeof statsResult === "object"
                        ? (statsResult as DashboardStats)
                        : {}
                );
                setCustomerBookings(
                    Array.isArray(bookingsResult)
                        ? (bookingsResult as RecentBooking[]).sort(
                              (a, b) =>
                                  Date.parse(b.createdAt) - Date.parse(a.createdAt)
                          )
                        : []
                );
                setErrorMessage("");
            } catch {
                setStats({});
                setCustomerBookings([]);
                setErrorMessage("Could not load your dashboard. Please try again.");
            }
        },
        []
    );

    useEffect(() => {
        if (isPending || !email) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard(email);
    }, [isPending, email, loadDashboard]);

    // One loading UI covers session + both API calls.
    const isLoading = isPending || stats === null || customerBookings === null;
    const bookings = (customerBookings ?? []).slice(0, 5);
    const inProgressBookings = (customerBookings ?? []).filter(
        (booking) => booking.status === "in-progress"
    ).length;

    const summaryCards = [
        {
            title: "Total Bookings",
            value: String(safeNumber(stats?.totalBookings)),
            icon: CalendarCheck2,
            accent: "text-blue-600 bg-blue-50",
        },
        {
            title: "Pending Bookings",
            value: String(safeNumber(stats?.pendingBookings)),
            icon: Clock3,
            accent: "text-amber-600 bg-amber-50",
        },
        {
            title: "Completed Bookings",
            value: String(safeNumber(stats?.completedBookings)),
            icon: CreditCard,
            accent: "text-emerald-600 bg-emerald-50",
        },
        {
            title: "In Progress Bookings",
            value: String(inProgressBookings),
            icon: Activity,
            accent: "text-cyan-600 bg-cyan-50",
        },
    ];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Customer Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    An overview of your repair requests and spending.
                </p>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-28 rounded-2xl bg-blue-100/70"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl bg-blue-100/70" />
                </div>
            )}

            {/* Error */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load your dashboard
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => email && loadDashboard(email)}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {!isLoading && !errorMessage && (
                <>
                    {/* Summary cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.title}
                                    className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-medium text-slate-500">
                                                {card.title}
                                            </p>
                                            <span
                                                className={cn(
                                                    "flex size-9 items-center justify-center rounded-xl",
                                                    card.accent
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </span>
                                        </div>
                                        <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                                            {card.value}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Recent bookings */}
                    <div className="mt-10">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Recent Bookings
                            </h2>
                            <Link
                                href="/dashboard/customer/bookings"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            >
                                View All Bookings
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="mt-4 flex flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                                <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                                    <CalendarCheck2 className="size-8" />
                                </span>
                                <p className="mt-5 text-lg font-semibold text-slate-900">
                                    No Bookings Yet
                                </p>
                                <p className="mt-2 max-w-sm text-sm text-slate-500">
                                    You haven&apos;t booked any services yet. Explore our
                                    services to get started.
                                </p>
                                <Link
                                    href="/services"
                                    className="mt-6 inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                                >
                                    Browse Services
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-900/5 transition hover:shadow-xl hover:shadow-blue-900/10 sm:flex-row sm:items-center"
                                    >
                                        {/* Service thumbnail */}
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50">
                                            {booking.serviceImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={booking.serviceImage}
                                                    alt={booking.serviceTitle}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <CalendarCheck2 className="size-7 text-blue-500" />
                                            )}
                                        </div>

                                        {/* Main info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-900">
                                                {booking.serviceTitle || "Repair service"}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {booking.category || "General"} ·{" "}
                                                {booking.technicianName || "FixMate technician"}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                        bookingBadgeStyle(booking.status)
                                                    )}
                                                >
                                                    {bookingLabel(booking.status)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                        paymentBadgeStyle(
                                                            booking.paymentStatus
                                                        )
                                                    )}
                                                >
                                                    {booking.paymentStatus === "paid"
                                                        ? "Paid"
                                                        : "Unpaid"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="shrink-0 sm:text-right">
                                            <p className="text-xs text-slate-400">
                                                Final amount
                                            </p>
                                            <p className="mt-0.5 text-lg font-bold text-blue-600">
                                                {formatAmount(
                                                    booking.finalAmount ?? booking.basePrice
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
