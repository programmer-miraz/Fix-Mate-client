import Link from "next/link";
import { notFound } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Clock3,
    FileText,
    Home,
    Mail,
    MapPin,
    ShieldCheck,
    Store,
    UserRound,
    Wrench,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Service } from "@/components/home/service-types";
import { getServiceById } from "@/lib/api/get-services";
import BookingForm from "./booking-form";

type Props = {
    params: Promise<{ id: string }>;
};

// Optional technician fields are not part of the service document yet.
// We only show them if a future record happens to include them.
type TechnicianExtra = {
    technicianImage?: string;
    technicianArea?: string;
    technicianBio?: string;
};

function getInitials(name?: string, email?: string) {
    const source = name?.trim() || email?.trim() || "Technician";
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
}

export default async function ServiceDetailsPage({ params }: Props) {
    const { id } = await params;

    // MongoDB ObjectIds are 24 hex characters. Anything else cannot be a service.
    if (!/^[a-f0-9]{24}$/i.test(id)) {
        notFound();
    }

    let service: Service | null = null;
    let hasError = false;

    try {
        service = await getServiceById(id);
    } catch {
        hasError = true;
    }

    if (hasError) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-blue-50/70 via-white to-white px-4">
                <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-900/5">
                    <AlertCircle className="mx-auto size-10 text-blue-500" />
                    <h1 className="mt-4 text-xl font-bold text-slate-900">
                        Could not load this service
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Please try again in a little while.
                    </p>
                    <Link
                        href="/services"
                        className={buttonVariants({
                            variant: "outline",
                            className:
                                "mt-6 h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-blue-700 hover:bg-blue-50",
                        })}
                    >
                        Back to services
                    </Link>
                </div>
            </main>
        );
    }

    // Pending, rejected, unavailable and missing services are never public.
    if (
        !service ||
        service.approvalStatus !== "approved" ||
        service.isAvailable !== true
    ) {
        notFound();
    }

    const price = Number(service.basePrice);
    const formattedPrice = Number.isFinite(price) ? `$${price.toFixed(2)}` : "$0.00";
    const isHomeVisit = service.serviceMode === "Home Visit";
    const technician = service as Service & TechnicianExtra;
    const technicianName = technician.technicianName || "FixMate Technician";

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Back link */}
                <Link
                    href="/services"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                    <ArrowLeft className="size-4" />
                    Back to services
                </Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Main area */}
                    <div>
                        <Card className="overflow-hidden rounded-2xl border-blue-100 shadow-xl shadow-blue-900/5">
                            {/* Image */}
                            <div className="h-64 bg-gradient-to-br from-blue-100 to-cyan-50 sm:h-80 lg:h-96">
                                {service.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Wrench className="size-14 text-blue-400" />
                                    </div>
                                )}
                            </div>

                            <CardContent className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                        {service.category || "General"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        <BadgeCheck className="size-3.5" />
                                        Available
                                    </span>
                                </div>

                                <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {service.title || "Repair service"}
                                </h1>

                                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                    {service.description || "No description provided."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Technician information */}
                        <Card className="mt-6 rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
                            <CardContent className="p-6 sm:p-8">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                    <UserRound className="size-5 text-blue-600" />
                                    Technician Information
                                </h2>

                                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                                    {technician.technicianImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={technician.technicianImage}
                                            alt={technicianName}
                                            className="size-16 shrink-0 rounded-2xl border border-blue-100 object-cover"
                                        />
                                    ) : (
                                        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white">
                                            {getInitials(technicianName, technician.technicianEmail)}
                                        </span>
                                    )}

                                    <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-600">
                                        <p className="text-base font-semibold text-slate-900">
                                            {technicianName}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Mail className="size-4 shrink-0 text-blue-500" />
                                            {technician.technicianEmail || "Not provided"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <MapPin className="size-4 shrink-0 text-blue-500" />
                                            {technician.technicianArea || "Not provided"}
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <FileText className="mt-0.5 size-4 shrink-0 text-blue-500" />
                                            {technician.technicianBio || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side area */}
                    <aside>
                        <Card className="rounded-2xl border-blue-100 shadow-xl shadow-blue-900/5 lg:sticky lg:top-24">
                            <CardContent className="p-6">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Starting price
                                </p>
                                <p className="mt-1 text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    {formattedPrice}
                                </p>

                                <div className="mt-6 space-y-3 border-t border-blue-50 pt-5 text-sm">
                                    <p className="flex items-center gap-2.5 text-slate-600">
                                        <Clock3 className="size-4 shrink-0 text-blue-500" />
                                        <span>
                                            <span className="block text-xs text-slate-400">
                                                Estimated duration
                                            </span>
                                            {service.estimatedDuration || "Not set"}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2.5 text-slate-600">
                                        {isHomeVisit ? (
                                            <Home className="size-4 shrink-0 text-cyan-600" />
                                        ) : (
                                            <Store className="size-4 shrink-0 text-blue-600" />
                                        )}
                                        <span>
                                            <span className="block text-xs text-slate-400">
                                                Service mode
                                            </span>
                                            {service.serviceMode || "Service"}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2.5 text-slate-600">
                                        <MapPin className="size-4 shrink-0 text-blue-500" />
                                        <span>
                                            <span className="block text-xs text-slate-400">
                                                Service area
                                            </span>
                                            {service.serviceArea || "Not set"}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2.5 text-slate-600">
                                        <ShieldCheck className="size-4 shrink-0 text-blue-500" />
                                        <span>
                                            <span className="block text-xs text-slate-400">
                                                Availability
                                            </span>
                                            Available
                                        </span>
                                    </p>
                                </div>

                                {/* Booking form + confirmation dialog */}
                                <BookingForm service={service} />
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </main>
    );
}
