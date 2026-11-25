import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton made only for the Service Details page.
export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Back link */}
                <Skeleton className="h-4 w-32 bg-blue-100/70" />

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Main area */}
                    <div>
                        {/* Image + service information */}
                        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5">
                            <Skeleton className="h-64 w-full rounded-none bg-blue-100/70 sm:h-80 lg:h-96" />

                            <div className="space-y-4 p-6 sm:p-8">
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-28 rounded-full bg-blue-100/70" />
                                    <Skeleton className="h-6 w-24 rounded-full bg-blue-100/70" />
                                </div>
                                <Skeleton className="h-8 w-3/4 bg-blue-100/70" />
                                <Skeleton className="h-4 w-full bg-blue-100/70" />
                                <Skeleton className="h-4 w-5/6 bg-blue-100/70" />
                                <Skeleton className="h-4 w-2/3 bg-blue-100/70" />
                            </div>
                        </div>

                        {/* Technician information */}
                        <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-900/5 sm:p-8">
                            <Skeleton className="h-5 w-48 bg-blue-100/70" />

                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                                <Skeleton className="size-16 shrink-0 rounded-2xl bg-blue-100/70" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40 bg-blue-100/70" />
                                    <Skeleton className="h-3.5 w-56 bg-blue-100/70" />
                                    <Skeleton className="h-3.5 w-32 bg-blue-100/70" />
                                    <Skeleton className="h-3.5 w-full bg-blue-100/70" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price / details / button sidebar */}
                    <aside>
                        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/5">
                            <Skeleton className="h-4 w-24 bg-blue-100/70" />
                            <Skeleton className="mt-2 h-10 w-32 bg-blue-100/70" />

                            <div className="mt-6 space-y-4 border-t border-blue-50 pt-5">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Skeleton className="size-4 shrink-0 rounded bg-blue-100/70" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-3 w-24 bg-blue-100/70" />
                                            <Skeleton className="h-3.5 w-3/4 bg-blue-100/70" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Request Repair button placeholder */}
                            <Skeleton className="mt-6 h-12 w-full rounded-xl bg-blue-100/70" />
                            <Skeleton className="mx-auto mt-3 h-3 w-40 bg-blue-100/70" />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
