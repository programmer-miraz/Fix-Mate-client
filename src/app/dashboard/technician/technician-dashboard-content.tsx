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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTechnicianDashboard } from "@/lib/api/get-services";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// Exact fields returned by GET /technician-dashboard/:email.
type TechnicianStats = {
    totalServices?: number;
    approvedServices?: number;
    totalBookings?: number;
    pendingBookings?: number;
    completedBookings?: number;
    amount?: number;
};

function safeNumber(value: number | undefined) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export default function TechnicianDashboardContent() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;

    const [stats, setStats] = useState<TechnicianStats | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadDashboard = useCallback(async (userEmail: string) => {
        try {
            const result = await getTechnicianDashboard(userEmail);

            if (!result || typeof result !== "object" || result.message) {
                throw new Error("Failed to load technician dashboard");
            }

            setStats(result as TechnicianStats);
            setErrorMessage("");
        } catch {
            setStats({});
            setErrorMessage("Could not load your dashboard. Please try again.");
        }
    }, []);

    useEffect(() => {
        if (isPending || !email) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard(email);
    }, [isPending, email, loadDashboard]);

    const isLoading = isPending || stats === null;

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
        {
            title: "Total Earnings",
            description: "Total amount received from paid bookings",
            value: `$${safeNumber(stats?.amount).toFixed(2)}`,
            icon: Wallet,
            accent: "text-cyan-600 bg-cyan-50",
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
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-32 rounded-2xl bg-blue-100/70"
                        />
                    ))}
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

            {/* Statistics cards */}
            {!isLoading && !errorMessage && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500">
                                                {card.title}
                                            </p>
                                            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                                                {card.value}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {card.description}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                                card.accent
                                            )}
                                        >
                                            <Icon className="size-5" />
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
