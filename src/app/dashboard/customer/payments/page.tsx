"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    CreditCard,
    Loader2,
    Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerPayments } from "@/lib/paymentApi.ts/payment";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// Fields returned by GET /payments/:email (wrapped in { success, payments }).
type Payment = {
    _id?: string;
    bookingId: string;
    serviceTitle: string;
    customerName: string;
    customerEmail: string;
    technicianName: string;
    technicianEmail: string;
    amount: number;
    currency: string;
    transactionId: string;
    stripeSessionId: string;
    status: string;
    createdAt: string;
};

type PaymentsResponse = {
    success?: boolean;
    payments?: Payment[];
};

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

function formatAmount(amount: number, currency?: string) {
    const value = Number(amount);
    const safeAmount = Number.isFinite(value) ? value.toFixed(2) : "0.00";
    return `${currency || "USD"} ${safeAmount}`;
}

function shortId(value?: string) {
    if (!value) return "N/A";
    return value.length > 14 ? `${value.slice(0, 12)}...` : value;
}

export default function PaymentHistry() {
    const { data: session, isPending } = useSession();
    const email = session?.user?.email;

    // null = waiting for session + API; one loading UI for both.
    const [payments, setPayments] = useState<Payment[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadPayments = useCallback(
        async (userEmail: string) => {
            try {
                const response = (await getCustomerPayments(
                    userEmail
                )) as PaymentsResponse;

                if (response?.success === false) {
                    throw new Error("Failed to fetch payments");
                }

                setPayments(
                    Array.isArray(response?.payments) ? response.payments : []
                );
                setErrorMessage("");
            } catch {
                setPayments([]);
                setErrorMessage("Could not load your payment history. Please try again.");
            }
        },
        []
    );

    useEffect(() => {
        if (isPending || !email) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPayments(email);
    }, [isPending, email, loadPayments]);

    const isLoading = isPending || payments === null;
    const allPayments = payments ?? [];

    // Summary values are calculated from the fetched data only.
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter(
        (payment) => payment.status === "paid"
    );
    const totalAmount = paidPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
    );
    const currency = paidPayments[0]?.currency || "USD";
    const latestDate = [...allPayments]
        .map((payment) => payment.createdAt)
        .filter(Boolean)
        .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Payment History
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Track and manage all your service payments.
                </p>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
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
                        Could not load payment history
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => email && loadPayments(email)}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Content */}
            {!isLoading && !errorMessage && (
                <>
                    {/* Summary cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <Card className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <CreditCard className="size-4 text-blue-600" />
                                    Total Payments
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">
                                    {totalPayments}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Wallet className="size-4 text-cyan-600" />
                                    Total Amount Paid
                                </div>
                                <p className="mt-3 text-2xl font-bold text-blue-600">
                                    {formatAmount(totalAmount, currency)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <CalendarDays className="size-4 text-blue-600" />
                                    Latest Payment Date
                                </div>
                                <p className="mt-3 text-lg font-bold text-slate-900">
                                    {formatDate(latestDate)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Empty state */}
                    {allPayments.length === 0 ? (
                        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                                <CreditCard className="size-8" />
                            </span>
                            <p className="mt-5 text-lg font-semibold text-slate-900">
                                No Payments Yet
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Your completed service payments will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table - tablet and desktop */}
                            <div className="mt-8 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5 sm:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-blue-100 bg-blue-50/60">
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Technician</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Date</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50">
                                        {allPayments.map((payment, index) => (
                                            <tr
                                                key={payment._id || payment.transactionId || index}
                                                className="transition hover:bg-blue-50/40"
                                            >
                                                <td className="px-5 py-3 font-semibold text-slate-800">
                                                    {payment.serviceTitle || "Repair service"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {payment.technicianName || "FixMate technician"}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {formatAmount(payment.amount, payment.currency)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatDate(payment.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                            payment.status === "paid"
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-amber-200 bg-amber-50 text-amber-700"
                                                        )}
                                                    >
                                                        {payment.status === "paid"
                                                            ? "Paid"
                                                            : payment.status || "Pending"}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-5 py-3 text-slate-500"
                                                    title={payment.transactionId}
                                                >
                                                    {shortId(payment.transactionId)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile rows */}
                            <div className="mt-6 space-y-3 sm:hidden">
                                {allPayments.map((payment, index) => (
                                    <Card
                                        key={payment._id || payment.transactionId || index}
                                        className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900">
                                                        {payment.serviceTitle || "Repair service"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {payment.technicianName || "FixMate technician"}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                        payment.status === "paid"
                                                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            : "border border-amber-200 bg-amber-50 text-amber-700"
                                                    )}
                                                >
                                                    {payment.status === "paid"
                                                        ? "Paid"
                                                        : payment.status || "Pending"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-50 pt-3 text-xs">
                                                <div>
                                                    <p className="text-slate-400">Amount</p>
                                                    <p className="mt-0.5 font-semibold text-slate-800">
                                                        {formatAmount(payment.amount, payment.currency)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Payment date</p>
                                                    <p className="mt-0.5 font-medium text-slate-700">
                                                        {formatDate(payment.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-slate-400">Transaction ID</p>
                                                    <p className="mt-0.5 break-all font-medium text-slate-700">
                                                        {payment.transactionId || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
