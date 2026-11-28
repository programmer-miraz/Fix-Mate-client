"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CreditCard, RefreshCw, Wallet, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAllTransactions } from "@/lib/api/get-services";
import { cn } from "@/lib/utils";

// Exact fields from the payments collection.
type Transaction = {
    _id: string;
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceTitle: string;
    technicianName: string;
    technicianEmail: string;
    amount: number;
    currency: string;
    transactionId: string;
    sessionId: string;
    status: string;
    createdAt: string;
};

function formatMoney(amount: number, currency?: string) {
    const value = Number(amount);
    const safeAmount = Number.isFinite(value) ? value : 0;
    const code = (currency || "usd").toUpperCase();
    const symbol = code === "USD" ? "$" : "";

    if (symbol) {
        return `${symbol}${safeAmount.toFixed(2)}`;
    }

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: code,
        }).format(safeAmount);
    } catch {
        return `${code} ${safeAmount.toFixed(2)}`;
    }
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

function shortId(value?: string) {
    if (!value) return "N/A";
    return value.length > 18 ? `${value.slice(0, 16)}...` : value;
}

export default function TransactionsContent() {
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const loadTransactions = useCallback(async () => {
        try {
            const result = await getAllTransactions();
            setTransactions(Array.isArray(result) ? (result as Transaction[]) : []);
        } catch {
            setTransactions([]);
            setErrorMessage("Could not load transactions. Please try again.");
            toast.error("Could not load transactions. Please try again.");
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTransactions();
    }, [loadTransactions]);

    const isLoading = transactions === null;
    const allTransactions = transactions ?? [];

    // All summary values come from the fetched data.
    const paidTransactions = allTransactions.filter(
        (transaction) => transaction.status === "paid"
    );
    const totalRevenue = paidTransactions.reduce(
        (sum, transaction) => sum + (Number(transaction.amount) || 0),
        0
    );
    const averageJob =
        paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0;
    const currency = paidTransactions[0]?.currency || "usd";

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Transactions
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    All Stripe payments recorded on FixMate.
                </p>
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
                        Could not load transactions
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            loadTransactions();
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
                        {/* Total Revenue - highlighted */}
                        <Card className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                                        Total revenue
                                    </p>
                                    <p className="mt-3 text-4xl font-bold tracking-tight">
                                        {formatMoney(totalRevenue, currency)}
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Wallet className="size-5" />
                                </span>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Payments
                                    </p>
                                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                        {allTransactions.length}
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <CreditCard className="size-5" />
                                </span>
                            </div>
                        </Card>

                        <Card className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Average job
                                    </p>
                                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                        {formatMoney(averageJob, currency)}
                                    </p>
                                </div>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                    <TrendingUp className="size-5" />
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Empty */}
                    {allTransactions.length === 0 ? (
                        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                            <CreditCard className="mx-auto size-10 text-blue-500" />
                            <p className="mt-4 font-semibold text-slate-900">
                                No transactions yet
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Stripe payments will appear here once customers pay for repairs.
                            </p>
                        </div>
                    ) : (
                        /* Table */
                        <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5">
                            <div className="overflow-x-auto">
                                <Table className="min-w-[900px] text-sm">
                                    <TableHeader className="border-b border-blue-100 bg-blue-50/60">
                                        <TableRow>
                                            <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</TableHead>
                                            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Technician</TableHead>
                                            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Service</TableHead>
                                            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</TableHead>
                                            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction ID</TableHead>
                                            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</TableHead>
                                            <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-blue-50">
                                        {allTransactions.map((transaction) => (
                                            <TableRow
                                                key={transaction._id}
                                                className="transition hover:bg-blue-50/40"
                                            >
                                                <TableCell className="px-5 py-3">
                                                    <p className="font-semibold text-slate-800">
                                                        {transaction.customerName || "Not provided"}
                                                    </p>
                                                    <p className="max-w-[180px] truncate text-xs text-slate-400">
                                                        {transaction.customerEmail || "No email"}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-slate-600">
                                                    {transaction.technicianName || "Not provided"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 font-medium text-slate-700">
                                                    {transaction.serviceTitle || "Repair service"}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                                                    {formatMoney(
                                                        transaction.amount,
                                                        transaction.currency
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-xs text-slate-500"
                                                    title={transaction.transactionId}
                                                >
                                                    <span className="block max-w-[170px] truncate">
                                                        {shortId(transaction.transactionId)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap px-4 py-3 text-slate-500">
                                                    {formatDate(transaction.createdAt)}
                                                </TableCell>
                                                <TableCell className="px-5 py-3">
                                                    <span
                                                        className={cn(
                                                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                                                            transaction.status === "paid"
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-amber-200 bg-amber-50 text-amber-700"
                                                        )}
                                                    >
                                                        {transaction.status || "pending"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
