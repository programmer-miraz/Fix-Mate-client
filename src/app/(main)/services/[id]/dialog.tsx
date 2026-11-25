"use client";

import { useState } from "react";
import { Loader2, UserRound, Wrench } from "lucide-react";
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
import { createBooking } from "@/lib/mutions-api/services";

// The same object that is sent to createBooking().
export type BookingData = {
    serviceId: string;
    serviceTitle: string;
    serviceImage: string;
    category: string;
    basePrice: number;
    technicianName: string;
    technicianEmail: string;
    customerName: string;
    customerEmail: string;
    customerPhone: FormDataEntryValue | null;
    address: FormDataEntryValue | null;
    preferredDate: Date;
    problemDescription: FormDataEntryValue | null;
    status: "requested";
    finalAmount: number;
    paymentStatus: "unpaid";
};

type CreateBookingResult = {
    acknowledged?: boolean;
    message?: string;
};

function formatPrice(value: number) {
    return Number.isFinite(value) ? `$${value.toFixed(2)}` : "$0.00";
}

function formatDate(value: Date) {
    if (!value || Number.isNaN(value.getTime())) return "Not set";
    return value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-0.5 break-words text-sm text-slate-700">
                {value || "Not provided"}
            </p>
        </div>
    );
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingData: BookingData;
    onSuccess: () => void;
};

export default function BookingDialog({
    open,
    onOpenChange,
    bookingData,
    onSuccess,
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleConfirm() {
        if (isSubmitting) return; // prevent multiple submissions
        setIsSubmitting(true);

        try {
            // Reuse the existing API function - no fetch here.
            const result = (await createBooking(bookingData)) as CreateBookingResult;

            if (!result || result.acknowledged !== true) {
                throw new Error(result?.message || "Could not submit your booking.");
            }

            toast.success("Booking request submitted successfully!");
            onOpenChange(false);
            onSuccess(); // reset the booking form
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not submit your booking. Please try again."
            );
            // Dialog stays open so the customer can try again.
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (isSubmitting) return; // do not close mid-request
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Confirm Your Repair Request</DialogTitle>
                    <DialogDescription>
                        Please review the details below before submitting.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-5 space-y-5">
                    {/* Service summary */}
                    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                        {bookingData.serviceImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={bookingData.serviceImage}
                                alt={bookingData.serviceTitle}
                                className="size-20 shrink-0 rounded-xl border border-blue-100 object-cover"
                            />
                        ) : (
                            <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                                <Wrench className="size-7" />
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                                {bookingData.serviceTitle || "Repair service"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {bookingData.category || "General"}
                            </p>
                            <p className="mt-1 text-lg font-bold text-blue-600">
                                {formatPrice(bookingData.basePrice)}
                            </p>
                        </div>
                    </div>

                    {/* Technician */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Wrench className="size-4 text-blue-600" />
                            Technician
                        </h3>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            <InfoRow label="Name" value={bookingData.technicianName} />
                            <InfoRow label="Email" value={bookingData.technicianEmail} />
                        </div>
                    </div>

                    {/* Customer + booking details */}
                    <div className="border-t border-blue-50 pt-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <UserRound className="size-4 text-blue-600" />
                            Booking details
                        </h3>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            <InfoRow label="Customer name" value={bookingData.customerName} />
                            <InfoRow label="Customer email" value={bookingData.customerEmail} />
                            <InfoRow
                                label="Phone"
                                value={String(bookingData.customerPhone ?? "")}
                            />
                            <InfoRow
                                label="Preferred date"
                                value={formatDate(bookingData.preferredDate)}
                            />
                            <div className="sm:col-span-2">
                                <InfoRow
                                    label="Address"
                                    value={String(bookingData.address ?? "")}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <InfoRow
                                    label="Problem description"
                                    value={String(bookingData.problemDescription ?? "")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status row */}
                    <div className="flex flex-wrap gap-2 border-t border-blue-50 pt-4 text-xs font-semibold">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                            Status: Requested
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                            Final amount: {formatPrice(bookingData.finalAmount)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            Payment: Unpaid
                        </span>
                    </div>

                </div>

                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Confirm & Submit"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
