import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton made only for the Browse Services page.
export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Heading */}
                <div className="max-w-3xl">
                    <Skeleton className="h-7 w-36 rounded-full bg-blue-100/70" />
                    <Skeleton className="mt-5 h-10 w-full max-w-2xl bg-blue-100/70" />
                    <Skeleton className="mt-2 h-10 w-3/4 max-w-xl bg-blue-100/70" />
                    <Skeleton className="mt-4 h-4 w-full max-w-2xl bg-blue-100/70" />
                    <Skeleton className="mt-2 h-4 w-2/3 max-w-lg bg-blue-100/70" />
                </div>

                {/* Search / filter / sort toolbar */}
                <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-900/5 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <Skeleton className="h-11 flex-1 rounded-xl bg-blue-100/70" />
                        <Skeleton className="h-11 w-full rounded-xl bg-blue-100/70 lg:w-48" />
                        <Skeleton className="h-11 w-full rounded-xl bg-blue-100/70 lg:w-48" />
                        <Skeleton className="h-11 w-full rounded-xl bg-blue-100/70 lg:w-48" />
                        <div className="flex gap-2">
                            <Skeleton className="h-11 w-24 rounded-xl bg-blue-100/70" />
                            <Skeleton className="h-11 w-28 rounded-xl bg-blue-100/70" />
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <Skeleton className="mt-6 h-4 w-32 bg-blue-100/70" />

                {/* Service cards */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"
                        >
                            {/* Image + category chip */}
                            <div className="relative h-44 bg-blue-50/50">
                                <Skeleton className="h-full w-full rounded-none bg-blue-100/70" />
                                <Skeleton className="absolute left-3 top-3 h-5 w-20 rounded-full bg-white/80" />
                            </div>

                            <div className="space-y-3 p-5">
                                <Skeleton className="h-5 w-4/5 bg-blue-100/70" />
                                <Skeleton className="h-3.5 w-1/2 bg-blue-100/70" />
                                <Skeleton className="h-3.5 w-1/3 rounded-full bg-blue-100/70" />
                                <Skeleton className="h-6 w-24 bg-blue-100/70" />
                                <Skeleton className="h-3.5 w-2/3 bg-blue-100/70" />
                                <Skeleton className="h-10 w-full rounded-xl bg-blue-100/70" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
