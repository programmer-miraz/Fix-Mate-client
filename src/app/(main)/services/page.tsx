import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle, SearchX, Sparkles, Wrench } from "lucide-react";

import ServiceCard from "@/components/home/ServiceCard";
import type { Service } from "@/components/home/service-types";
import { customerServices } from "@/lib/api/get-services";
import ServiceFilters from "./ServiceFilters";
import BrowseServicesSkeleton from "./loading";

type Props = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        mode?: string;
        sort?: string;
    }>;
};

const Services = async ({ searchParams }: Props) => {
    // Next.js gives us the URL filters; we pass them straight to the API.
    const filters = await searchParams;
    const query = new URLSearchParams(
        filters as Record<string, string>
    ).toString();

    let services: Service[] = [];
    let hasError = false;

    try {
        const response = await customerServices(query);
        services = Array.isArray(response) ? (response as Service[]) : [];
    } catch {
        // Keep the page usable even when the backend is unavailable.
        hasError = true;
    }

    return (
        <div className="mt-8">
            <ServiceFilters />

            {/* Results count */}
            <p className="mt-6 text-sm text-slate-500">
                {hasError ? (
                    "We could not load services right now."
                ) : (
                    <>
                        Showing{" "}
                        <span className="font-semibold text-blue-600">
                            {services.length}
                        </span>{" "}
                        {services.length === 1 ? "service" : "services"}
                    </>
                )}
            </p>

            {/* Error state */}
            {hasError && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-blue-500" />
                    <p className="mt-4 text-base font-semibold text-slate-900">
                        Could not load services
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Please try again in a little while.
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!hasError && services.length === 0 && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                        {query ? (
                            <SearchX className="size-8" />
                        ) : (
                            <Wrench className="size-8" />
                        )}
                    </span>
                    <p className="mt-5 text-lg font-semibold text-slate-900">
                        {query ? "No services match your filters" : "No services yet"}
                    </p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                        {query
                            ? "Try a different search or clear the filters to see all available services."
                            : "New approved services will appear here soon."}
                    </p>
                    {query && (
                        <Link
                            href="/services"
                            className="mt-6 inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                        >
                            Clear Filters
                        </Link>
                    )}
                </div>
            )}

            {/* Services grid */}
            {!hasError && services.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {services.map((service) => (
                        <ServiceCard
                            key={service._id}
                            service={service}
                            showArea
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function servicesPage({ searchParams }: Props) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Heading */}
                <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                        <Sparkles className="size-3.5" />
                        Browse Services
                    </span>
                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        Find the right repair expert for{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            your device.
                        </span>
                    </h1>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                        Explore trusted repair services from verified technicians.
                        Search, filter and compare prices to find the perfect fit.
                    </p>
                </div>

                <Suspense fallback={<BrowseServicesSkeleton />}>
                    <Services searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    );
}
