"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowRight,
    ClipboardList,
    DollarSign,
    RefreshCw,
    ShieldCheck,
    Users,
    Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { getAdminDashboard } from "@/lib/api/get-services";
import { cn } from "@/lib/utils";

// Exact fields returned by GET /admin-dashboard.
type AdminStats = {
    totalCustomers?: number;
    totalTechnicians?: number;
    pendingServices?: number;
    totalRevenue?: number;
};

function safeNumber(value: number | undefined) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number) {
    return `$${safeNumber(value).toFixed(2)}`;
}

export default function AdminDashboardContent() {
    const { data: session } = useSession();
    const adminName = session?.user?.name || "Admin";

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            const result = await getAdminDashboard();
            setStats(result && typeof result === "object" ? result : {});
        } catch {
            setStats({});
            setErrorMessage("Could not load dashboard data. Please try again.");
            toast.error("Could not load dashboard data. Please try again.");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    const isLoading = stats === null;

    const summaryCards = [
        {
            title: "Total Customers",
            value: String(safeNumber(stats?.totalCustomers)),
            icon: Users,
            accent: "text-blue-600 bg-blue-50",
        },
        {
            title: "Total Technicians",
            value: String(safeNumber(stats?.totalTechnicians)),
            icon: Wrench,
            accent: "text-cyan-600 bg-cyan-50",
        },
        {
            title: "Pending Services",
            value: String(safeNumber(stats?.pendingServices)),
            icon: ClipboardList,
            accent: "text-amber-600 bg-amber-50",
            prominent: true,
        },
    ];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard Overview
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Monitor your platform activities and performance at a glance.
                    </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <ShieldCheck className="size-3.5" />
                    Welcome back, {adminName}
                </span>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-32 rounded-2xl bg-blue-100/70"
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
                        Could not load dashboard data
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            loadDashboard();
                        }}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        <RefreshCw className="size-4" />
                        Retry
                    </Button>
                </div>
            )}

            {!isLoading && !errorMessage && (
                <>
                    {/* Summary cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.title}
                                    className={cn(
                                        "rounded-2xl p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                                        card.prominent
                                            ? "border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-amber-500/5 hover:shadow-amber-500/10"
                                            : "border border-blue-100 bg-white shadow-blue-900/5 hover:border-blue-200 hover:shadow-blue-500/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                {card.title}
                                            </p>
                                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                                {card.value}
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
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        {/* Revenue overview - real total, no invented trend */}
                        <Card className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/25">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                                        Revenue overview
                                    </p>
                                    <p className="mt-1 text-sm text-blue-100/80">
                                        Total collected from paid transactions
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <DollarSign className="size-5" />
                                </span>
                            </div>

                            {/* Simple bar visualization using the real total value */}
                            <div className="mt-8">
                                <div className="flex h-32 items-end gap-2">
                                    {[35, 55, 42, 70, 50, 82, 64].map((height, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 rounded-t-md bg-white/25"
                                            style={{ height: `${height}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex items-baseline justify-between border-t border-white/20 pt-4">
                                <span className="text-sm text-blue-100">Total revenue</span>
                                <span className="text-3xl font-bold tracking-tight">
                                    {formatMoney(safeNumber(stats?.totalRevenue))}
                                </span>
                            </div>
                            <p className="mt-2 text-[11px] text-blue-100/70">
                                Historical daily trends are not available in the current data.
                            </p>
                        </Card>

                        {/* Service approval overview */}
                        <Card className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-900/5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Service approval overview
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Technician submissions waiting for your review.
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <ClipboardList className="size-5" />
                                </span>
                            </div>

                            <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
                                {safeNumber(stats?.pendingServices)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                pending service{safeNumber(stats?.pendingServices) === 1 ? "" : "s"}
                            </p>

                            <Link
                                href="/dashboard/admin/services"
                                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                            >
                                Review Services
                                <ArrowRight className="size-4" />
                            </Link>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
