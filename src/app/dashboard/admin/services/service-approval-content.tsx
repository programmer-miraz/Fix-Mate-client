"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Wrench,
    XCircle,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Service } from "@/components/home/service-types";
import { getAllServices } from "@/lib/api/get-services";
import { updateServiceStatus } from "@/lib/mutions-api/services";
import { cn } from "@/lib/utils";

type StatusAction = {
    service: Service;
    status: "approved" | "rejected";
};

type UpdateResult = {
    success?: boolean;
    acknowledged?: boolean;
    message?: string;
};

const statusTabs = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
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

function statusStyle(status?: string) {
    if (status === "approved")
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "rejected") return "border border-red-200 bg-red-50 text-red-700";
    return "border border-amber-200 bg-amber-50 text-amber-700";
}

export default function ServiceApprovalContent() {
    const [services, setServices] = useState<Service[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
    const [updatingId, setUpdatingId] = useState("");

    const loadServices = useCallback(async () => {
        try {
            const result = await getAllServices();
            setServices(Array.isArray(result) ? (result as Service[]) : []);
        } catch {
            setServices([]);
            setErrorMessage("Could not load services. Please try again.");
            toast.error("Could not load services. Please try again.");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadServices();
    }, [loadServices]);

    const isLoading = services === null;
    const allServices = services ?? [];

    function serviceCount(key: string) {
        if (key === "all") return allServices.length;
        return allServices.filter(
            (service) => (service.approvalStatus || "pending") === key
        ).length;
    }

    const visibleServices =
        activeTab === "all"
            ? allServices
            : allServices.filter(
                  (service) => (service.approvalStatus || "pending") === activeTab
              );

    async function confirmAction() {
        if (!pendingAction || updatingId) return;
        setUpdatingId(pendingAction.service._id);

        try {
            const result = (await updateServiceStatus(
                pendingAction.service._id,
                pendingAction.status
            )) as UpdateResult;

            if (result?.success === false || result?.acknowledged !== true) {
                throw new Error(result?.message || "Could not update the service.");
            }

            toast.success(
                `Service ${pendingAction.status === "approved" ? "approved" : "rejected"} successfully.`
            );
            setPendingAction(null);
            await loadServices(); // refresh list + tab counts
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not update the service."
            );
        } finally {
            setUpdatingId("");
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header + tabs */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Service approval
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Only approved and available services appear on the public site.
                    </p>
                </div>

                <div className="flex flex-wrap gap-1 rounded-xl border border-blue-100 bg-white p-1 shadow-sm">
                    {statusTabs.map((tab) => (
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
                            {tab.label}{" "}
                            <span className="opacity-75">{serviceCount(tab.key)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-16 w-full rounded-2xl bg-blue-100/70"
                        />
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load services
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            loadServices();
                        }}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        <RefreshCw className="size-4" />
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !errorMessage && visibleServices.length === 0 && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <Wrench className="size-9 text-blue-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        No services in this tab
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Choose another status to review technician submissions.
                    </p>
                </div>
            )}

            {/* Table */}
            {!isLoading && !errorMessage && visibleServices.length > 0 && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[760px] text-sm">
                            <TableHeader className="border-b border-blue-100 bg-blue-50/60">
                                <TableRow>
                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Service
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Technician
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Price
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Submitted
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-blue-50">
                                {visibleServices.map((service) => {
                                    const status = service.approvalStatus || "pending";

                                    return (
                                        <TableRow
                                            key={service._id}
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50">
                                                        {service.image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={service.image}
                                                                alt={service.title}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <Wrench className="size-5 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-800">
                                                            {service.title || "Repair service"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {service.category || "General"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-slate-600">
                                                {service.technicianName || "FixMate technician"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 font-semibold text-slate-900">
                                                {formatPrice(Number(service.basePrice))}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-slate-500">
                                                {formatDate(service.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                                                        statusStyle(status)
                                                    )}
                                                >
                                                    {status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-3">
                                                <div className="flex gap-2">
                                                    {status !== "approved" && (
                                                        <Button
                                                            type="button"
                                                            disabled={Boolean(updatingId)}
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    service,
                                                                    status: "approved",
                                                                })
                                                            }
                                                            className="h-9 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="size-3.5" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {status !== "rejected" && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={Boolean(updatingId)}
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    service,
                                                                    status: "rejected",
                                                                })
                                                            }
                                                            className="h-9 cursor-pointer rounded-lg border-red-200 px-3.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            <XCircle className="size-3.5" />
                                                            Reject
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Confirmation dialog */}
            <Dialog
                open={Boolean(pendingAction)}
                onOpenChange={(open) => !open && !updatingId && setPendingAction(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction?.status === "approved"
                                ? "Approve this service?"
                                : "Reject this service?"}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingAction && (
                                <>
                                    {pendingAction.status === "approved"
                                        ? "This service will be visible on the public site if it is available."
                                        : "This service will be hidden from the public site."}{" "}
                                    <span className="font-semibold text-slate-800">
                                        {pendingAction.service.title}
                                    </span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPendingAction(null)}
                            disabled={Boolean(updatingId)}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmAction}
                            disabled={Boolean(updatingId)}
                            className={cn(
                                "h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold text-white shadow-md transition disabled:opacity-50",
                                pendingAction?.status === "approved"
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/20 hover:from-blue-700 hover:to-cyan-600"
                                    : "bg-red-600 shadow-red-500/20 hover:bg-red-700"
                            )}
                        >
                            {updatingId ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : pendingAction?.status === "approved" ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                <XCircle className="size-4" />
                            )}
                            {pendingAction?.status === "approved"
                                ? "Approve"
                                : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
