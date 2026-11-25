"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Loader2,
    MapPin,
    Phone,
    Wrench,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import type { Service } from "@/components/home/service-types";
import BookingDialog from "./dialog";

import type { BookingData } from "./dialog";

const fieldClass =
    "h-11 w-full rounded-xl border border-blue-100 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

export default function BookingForm({ service }: { service: Service }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isDone, setIsDone] = useState(false);
    const [descriptionLength, setDescriptionLength] = useState(0);

    function handleSendRequest(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!session?.user?.name || !session?.user?.email) {
            toast.error("Please sign in to request a repair.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const description = String(formData.get("problemDescription") || "").trim();

        if (description.length < 20) {
            toast.error("Please describe the problem in at least 20 characters.");
            return;
        }

        // Build the object once; the confirmation dialog shows this exact data.
        const data: BookingData = {
            serviceId: service._id,
            serviceTitle: service.title,
            serviceImage: service.image,
            category: service.category,
            basePrice: service.basePrice,
            technicianName: service.technicianName,
            technicianEmail: service.technicianEmail,
            customerName: session.user.name,
            customerEmail: session.user.email,
            customerPhone: formData.get("customerPhone"),
            address: formData.get("address"),
            preferredDate: new Date(formData.get("preferredDate") as string),
            problemDescription: description,
            status: "requested",
            finalAmount: service.basePrice,
            paymentStatus: "unpaid",
        };

        setBookingData(data);
        setIsFormOpen(false); // close the form dialog
        setIsConfirmOpen(true); // open the confirmation dialog
    }

    // While Better Auth checks the session, show only a loading indicator here.
    if (isPending) {
        return (
            <div
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50"
                aria-label="Loading account"
            >
                <Loader2 className="size-5 animate-spin text-blue-600" />
            </div>
        );
    }
    
    return (
        <div className="mt-6">
            {/* Guests are sent to Sign In; logged-in users open the form dialog */}
            <button
                type="button"
                onClick={() => {
                    if (!session?.user) {
                    router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
                        return;
                    }
                    if (session?.user?.role !== "customer") {
                        toast.error("Only customers can request a repair");
                        return;
                    }

                    setIsFormOpen(true);
                }}
                className="h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-cyan-600 inline-flex"
            >
                <Wrench className="size-4" />
                Request Repair
            </button>

            {isDone && (
                <div className="mt-4 flex flex-col items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <p className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="size-4" />
                        Booking request submitted.
                    </p>
                    <Link
                        href="/dashboard/customer/bookings"
                        className="cursor-pointer font-semibold underline underline-offset-2"
                    >
                        View My Bookings
                    </Link>
                </div>
            )}

            {/* Form dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Request this repair</DialogTitle>
                        <DialogDescription>
                            Tell us a few details so the technician can prepare.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogClose
                        aria-label="Close"
                        className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                        <X className="size-4" />
                    </DialogClose>

                    <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
                        {/* Name and email come from the session */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="customerName">Name</Label>
                                <Input
                                    id="customerName"
                                    value={session?.user?.name || ""}
                                    readOnly
                                    className={`${fieldClass} mt-1.5 bg-slate-50 text-slate-500`}
                                />
                            </div>
                            <div>
                                <Label htmlFor="customerEmail">Email</Label>
                                <Input
                                    id="customerEmail"
                                    value={session?.user?.email || ""}
                                    readOnly
                                    className={`${fieldClass} mt-1.5 bg-slate-50 text-slate-500`}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Phone */}
                            <div>
                                <Label htmlFor="customerPhone">Phone</Label>
                                <div className="relative mt-1.5">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="customerPhone"
                                        name="customerPhone"
                                        type="tel"
                                        required
                                        placeholder="01611-223344"
                                        className={`${fieldClass} pl-10`}
                                    />
                                </div>
                            </div>

                            {/* Preferred date */}
                            <div>
                                <Label htmlFor="preferredDate">Preferred date</Label>
                                <div className="relative mt-1.5">
                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="preferredDate"
                                        name="preferredDate"
                                        type="date"
                                        required
                                        className={`${fieldClass} pl-10`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <div className="relative mt-1.5">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="address"
                                    name="address"
                                    required
                                    placeholder="House, road, area"
                                    className={`${fieldClass} pl-10`}
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Where the technician should come.
                            </p>
                        </div>

                        {/* Problem description */}
                        <div>
                            <Label htmlFor="problemDescription">What is wrong?</Label>
                            <textarea
                                id="problemDescription"
                                name="problemDescription"
                                required
                                minLength={20}
                                rows={5}
                                placeholder="Model, what happened, and what you have already tried"
                                onChange={(event) =>
                                    setDescriptionLength(event.target.value.length)
                                }
                                className={`${fieldClass} min-h-28 resize-y py-3`}
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                {descriptionLength}/20 characters minimum
                            </p>
                        </div>

                        <DialogFooter className="pt-2">
                            <DialogClose
                                className="h-10 cursor-pointer rounded-xl border border-blue-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            >
                                Cancel
                            </DialogClose>
                            <Button
                                type="submit"
                                className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                            >
                                Send request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation dialog (shows the same data before submitting) */}
            {bookingData && (
                <BookingDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    bookingData={bookingData}
                    onSuccess={() => setIsDone(true)}
                />
            )}
        </div>
    );
}
