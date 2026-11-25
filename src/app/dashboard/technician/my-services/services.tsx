"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
    getMyServices,

} from "@/lib/api/get-services";
import { cn } from "@/lib/utils";
import ActionButtons from "./edit-delete";
import { updateServiceAvailability } from "@/lib/mutions-api/services";
;

// Fields returned by the existing /my-services/:userId Express route.
export type MyService = {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: "Home Visit" | "Shop Drop-off";
    serviceArea: string;
    technicianId: string;
    technicianEmail: string;
    approvalStatus: "pending" | "approved" | "rejected";
    isAvailable: boolean;
    createdAt: string;
};

function getApprovalStyle(status?: string) {
    if (status === "approved") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "rejected") return "border border-red-200 bg-red-50 text-red-700";
    return "border border-amber-200 bg-amber-50 text-amber-700";
}

function getApprovalLabel(status?: string) {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
}

function formatPrice(price: number) {
    return Number.isFinite(price) ? `$${price.toFixed(2)}` : "$0.00";
}

// Approval badge used in both the table and the mobile rows.
function ApprovalBadge({ status }: { status?: string }) {
    return (
        <span
            className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                getApprovalStyle(status)
            )}
        >
            {getApprovalLabel(status)}
        </span>
    );
}

// ON / OFF switch. It keeps its own state so the UI updates instantly.
function AvailabilityToggle({
    serviceId,
    initialAvailable,
}: {
    serviceId: string;
    initialAvailable: boolean;
}) {
    const [isAvailable, setIsAvailable] = useState(initialAvailable);
    const [isUpdating, setIsUpdating] = useState(false);

    async function handleToggle() {
        if (isUpdating) return; // prevent double clicks

        const nextValue = !isAvailable;
        setIsAvailable(nextValue); // show the change immediately
        setIsUpdating(true);

        try {
            await updateServiceAvailability(serviceId, nextValue);
            toast.success(
                nextValue ? "Service is now available" : "Service is now unavailable"
            );
        } catch {
            setIsAvailable(!nextValue); // put the switch back on failure
            toast.error("Could not update availability. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            aria-label={isAvailable ? "Mark unavailable" : "Mark available"}
            onClick={handleToggle}
            disabled={isUpdating}
            className={cn(
                "relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 disabled:opacity-60",
                isAvailable ? "bg-blue-600" : "bg-slate-300"
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-400 ease-in-out",
                    isAvailable ? "translate-x-[1px]" : "-translate-x-5"
                )}
            />
        </button>
    );
}


const Services = () => {
    const { data: session, isPending } = useSession();

    const userId = session?.user?.id;

    const [services, setServices] = useState<MyService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadServices = async () => {
        if (!userId) return;
        setIsLoading(true);

        try {
            const result = await getMyServices(userId);

            setServices(Array.isArray(result) ? result : []);
            setErrorMessage("");
        } catch {
            setErrorMessage("We could not load your services. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isPending) return;

        const timer = setTimeout(() => {
            loadServices();
        }, 0);

        return () => clearTimeout(timer);
    }, [isPending, userId]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        <Wrench className="size-3.5" />
                        Technician
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        My Services
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Manage and monitor all your repair services.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                        Total services:{" "}
                        <span className="font-bold text-blue-600">{services.length}</span>
                    </span>
                    <Link
                        href="/dashboard/technician/add-services"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                    >
                        <Plus className="size-4" />
                        Add Service
                    </Link>
                </div>
            </div>

            {/* Loading state */}
            {(isPending || isLoading) && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-900/5">
                    <Skeleton className="h-5 w-32 bg-blue-100/70" />
                    <div className="mt-6 space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-12 w-full rounded-xl bg-blue-100/70"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !errorMessage && services.length === 0 && (
                <Card className="mx-auto mt-10 max-w-xl rounded-2xl border-blue-100 text-center shadow-lg shadow-blue-900/5">
                    <CardContent className="flex flex-col items-center px-6 py-12">
                        <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                            <Wrench className="size-8" />
                        </span>
                        <p className="mt-5 text-lg font-semibold text-slate-900">
                            No services yet
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            You have not added any repair services. Create your first service
                            to start receiving bookings.
                        </p>
                        <Link
                            href="/dashboard/technician/add-services"
                            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                        >
                            <Plus className="size-4" />
                            Add your first service
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Table - tablet and desktop */}
            {!isLoading && !errorMessage && services.length > 0 && (
                <div className="mt-8 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5 md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-blue-100 bg-blue-50/60">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Review</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Available</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {services.map((service) => (
                                <tr key={service._id} className="transition hover:bg-blue-50/40">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {service.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={service.image}
                                                    alt={service.title}
                                                    className="size-12 shrink-0 rounded-lg border border-blue-100 bg-blue-50 object-cover"
                                                />
                                            ) : (
                                                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                                    <Wrench className="size-5" />
                                                </span>
                                            )}
                                            <span className="line-clamp-1 font-semibold text-slate-800">
                                                {service.title || "Untitled service"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {service.category || "General"}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">
                                        {formatPrice(Number(service.basePrice))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <ApprovalBadge status={service.approvalStatus} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <AvailabilityToggle
                                            serviceId={service._id}
                                            initialAvailable={service.isAvailable}
                                        />
                                    </td>
                                    <td className="px-5 py-3">
                                        <ActionButtons
                                            service={service}
                                            onServiceUpdated={loadServices}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile rows - same information, stacked layout */}
            {!isLoading && !errorMessage && services.length > 0 && (
                <div className="mt-6 space-y-3 md:hidden">
                    {services.map((service) => (
                        <Card
                            key={service._id}
                            className="overflow-hidden rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5"
                        >
                            <div className="flex items-center gap-3 p-4">
                                {service.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="size-14 shrink-0 rounded-xl border border-blue-100 bg-blue-50 object-cover"
                                    />
                                ) : (
                                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                        <Wrench className="size-6" />
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-800">
                                        {service.title || "Untitled service"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {service.category || "General"} · {formatPrice(Number(service.basePrice))}
                                    </p>
                                </div>
                                <ApprovalBadge status={service.approvalStatus} />
                            </div>
                            <div className="flex items-center justify-between border-t border-blue-50 px-4 py-3">
                                <span className="text-xs font-medium text-slate-500">Available</span>
                                <AvailabilityToggle
                                    serviceId={service._id}
                                    initialAvailable={service.isAvailable}
                                />
                            </div>
                            <div className="border-t border-blue-50 px-4 py-3">
                                <ActionButtons
                                    service={service}
                                    onServiceUpdated={loadServices}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Services;
