"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    BadgeCheck,
    CalendarCheck2,
    CheckCircle2,
    Clock3,
    Wallet,
    Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getTechnicianBookings,
    getTechnicianDashboard,
} from "@/lib/api/get-services";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import BookingStatusChart from "./booking-status-chart";

import type { BookingStatusCounts } from "./booking-status-chart";

// Exact fields returned by GET /technician-dashboard/:email.
type TechnicianStats = {
    totalServices?: number;
    approvedServices?: number;
    totalBookings?: number;
    pendingBookings?: number;
    completedBookings?: number;
    totalEarnings?: number;
};

// Only the status field is needed from the existing bookings API.
type TechnicianBooking = {
    status?: string;
};

function safeNumber(value: number | undefined) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export default function TechnicianDashboardContent() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;

    const [stats, setStats] = useState<TechnicianStats | null>(null);
    const [bookings, setBookings] = useState<TechnicianBooking[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadDashboard = useCallback(async (userEmail: string) => {
        try {
            // Both calls already exist; no new API function is needed.
            const [statsResult, bookingsResult] = await Promise.all([
                getTechnicianDashboard(userEmail),
                getTechnicianBookings(userEmail),
            ]);

            if (!statsResult || typeof statsResult !== "object" || statsResult.message) {
                throw new Error("Failed to load technician dashboard");
            }

            setStats(statsResult as TechnicianStats);
            setBookings(
                Array.isArray(bookingsResult)
                    ? (bookingsResult as TechnicianBooking[])
                    : []
            );
            setErrorMessage("");
        } catch {
            setStats({});
            setBookings([]);
            setErrorMessage("Could not load your dashboard. Please try again.");
        }
    }, []);

    useEffect(() => {
        if (isPending || !email) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard(email);
    }, [isPending, email, loadDashboard]);

    // One loading UI covers session + both API calls.
    const isLoading = isPending || stats === null || bookings === null;
    const allBookings = bookings ?? [];

    // Count real booking values with filter(). The chart and the list below
    // both use this same object, so they can never disagree.
    const statusCounts: BookingStatusCounts = {
        pending: allBookings.filter((booking) =>
            ["requested", "pending"].includes(booking.status || "")
        ).length,
        confirmed: allBookings.filter((booking) =>
            ["accepted", "confirmed"].includes(booking.status || "")
        ).length,
        inProgress: allBookings.filter(
            (booking) => booking.status === "in-progress"
        ).length,
        completed: allBookings.filter(
            (booking) => booking.status === "completed"
        ).length,
        cancelled: allBookings.filter((booking) =>
            ["cancelled", "rejected"].includes(booking.status || "")
        ).length,
    };

    const statCards = [
        {
            title: "Total Services",
            description: "Total services added by the technician",
            value: String(safeNumber(stats?.totalServices)),
            icon: Wrench,
            accent: "text-blue-600 bg-blue-50",
        },
        {
            title: "Approved Services",
            description: "Services approved by the admin",
            value: String(safeNumber(stats?.approvedServices)),
            icon: BadgeCheck,
            accent: "text-emerald-600 bg-emerald-50",
        },
        {
            title: "Total Bookings",
            description: "Total bookings received by the technician",
            value: String(safeNumber(stats?.totalBookings)),
            icon: CalendarCheck2,
            accent: "text-blue-600 bg-blue-50",
        },
        {
            title: "Pending Bookings",
            description: "Bookings waiting for action",
            value: String(safeNumber(stats?.pendingBookings)),
            icon: Clock3,
            accent: "text-amber-600 bg-amber-50",
        },
        {
            title: "Completed Bookings",
            description: "Successfully completed bookings",
            value: String(safeNumber(stats?.completedBookings)),
            icon: CheckCircle2,
            accent: "text-emerald-600 bg-emerald-50",
        },
    ];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome Back!
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Here&apos;s an overview of your technician activity.
                </p>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-32 rounded-2xl bg-blue-100/70"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-72 w-full rounded-2xl bg-blue-100/70" />
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
                    {/* Statistics cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {statCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.title}
                                    className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                {card.title}
                                            </p>
                                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                                {card.value}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {card.description}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                                                card.accent
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}

                        {/* Total Earnings - highlighted card */}
                        <Card className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                                        Total Earnings
                                    </p>
                                    <p className="mt-3 text-4xl font-bold tracking-tight">
                                        ${safeNumber(stats?.totalEarnings).toFixed(2)}
                                    </p>
                                    <p className="mt-1 text-xs text-blue-100/80">
                                        Total amount received from paid bookings
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Wallet className="size-5" />
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Booking status chart */}
                    <div className="mt-8">
                        <BookingStatusChart counts={statusCounts} />
                    </div>
                </>
            )}
        </div>
    );
}
