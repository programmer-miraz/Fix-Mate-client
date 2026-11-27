"use client";

import { CalendarDays, Mail, MapPin, UserRound, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handlePayment } from "@/lib/paymentApi.ts/payment";

// Fields actually stored in the bookings collection by the customer booking form.
export type CustomerBooking = {
    _id: string;
    serviceId: string;
    serviceTitle: string;
    serviceImage: string;
    category: string;
    basePrice: number;
    technicianName: string;
    technicianEmail: string;
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

function label(value?: string) {
    if (!value) return "Not set";
    if (value === "in-progress") return "In progress";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function StatusBadge({ status }: { status?: string }) {
    let style = "border border-amber-200 bg-amber-50 text-amber-700";

    if (status === "accepted") style = "border border-blue-200 bg-blue-50 text-blue-700";
    if (status === "in-progress") style = "border border-cyan-200 bg-cyan-50 text-cyan-700";
    if (status === "completed") style = "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "rejected" || status === "cancelled")
        style = "border border-red-200 bg-red-50 text-red-700";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                style
            )}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {label(status)}
        </span>
    );
}

export function PaymentBadge({ paymentStatus }: { paymentStatus?: string }) {
    const isPaid = paymentStatus === "paid";

    return (
        <span
            className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isPaid
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-slate-50 text-slate-600"
            )}
        >
            {isPaid ? "Paid" : "Unpaid"}
        </span>
    );
}

type Props = {
    booking: CustomerBooking;
    onCancel: () => void;
    isCancelling: boolean;
    searchParams: {
        canceled?: string;
    };
};

export default function BookingCard({ searchParams, booking, onCancel, isCancelling }: Props) {
    const canCancel = booking.status === "requested";
    const canPay =
        booking.status === "completed" && booking.paymentStatus !== "paid";
    const canceled = searchParams.canceled
    if (canceled) {
        console.log(
            'Order canceled -- continue to shop around and check out when you\'re ready.'
        )
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5 transition hover:shadow-xl hover:shadow-blue-900/10 md:flex-row">
            {/* Left: service + customer details */}
            <div className="min-w-0 flex-1 p-5">
                <div className="flex gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50">
                        {booking.serviceImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={booking.serviceImage}
                                alt={booking.serviceTitle}
                                className="size-full object-cover"
                            />
                        ) : (
                            <Wrench className="size-7 text-blue-500" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
                            {booking.serviceTitle || "Repair service"}
                        </h2>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <UserRound className="size-3.5" />
                                {booking.technicianName || "FixMate technician"}
                            </span>
                            {booking.technicianEmail && (
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="size-3.5" />
                                    {booking.technicianEmail}
                                </span>
                            )}
                        </p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="size-3.5" />
                                Requested {formatDate(booking.createdAt)}
                            </span>
                            <span>Preferred {formatDate(booking.preferredDate)}</span>
                        </p>
                    </div>
                </div>

                <p className="mt-4 flex items-start gap-1.5 text-sm text-slate-600">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                    {booking.address || "Address not provided"}
                </p>

                {booking.problemDescription && (
                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        {booking.problemDescription}
                    </p>
                )}
            </div>

            {/* Right: ticket, price and action */}
            <div className="flex w-full shrink-0 flex-col border-t border-blue-50 p-5 md:w-56 md:border-l md:border-t-0">
                <p className="text-xs text-slate-400">
                    Ticket #{booking._id?.slice(-6) || "N/A"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={booking.status} />
                    <PaymentBadge paymentStatus={booking.paymentStatus} />
                </div>

                <p className="mt-4 text-xs text-slate-500">Starting price</p>
                <p className="text-2xl font-bold text-slate-900">
                    {formatPrice(Number(booking.basePrice))}
                </p>

                {booking.status === "completed" && Number.isFinite(booking.finalAmount) && (
                    <p className="mt-1 text-sm font-semibold text-blue-600">
                        Final amount: {formatPrice(Number(booking.finalAmount))}
                    </p>
                )}

                <div className="mt-4 md:mt-auto">
                    {canCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isCancelling}
                            className="h-10 w-full cursor-pointer rounded-xl border-blue-200 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:opacity-50"
                        >
                            Cancel request
                        </Button>
                    )}

                    {/* Payment UI is ready for the existing Stripe integration. */}
                    {canPay && (
                        <section>
                            <Button
                                type="button"
                                onClick={() => handlePayment(booking._id)}
                                className="h-10 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                            >
                                Pay Now
                            </Button>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
