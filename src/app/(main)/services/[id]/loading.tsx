import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <Skeleton className="h-4 w-32 bg-blue-100" />

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
                            <Skeleton className="h-64 w-full rounded-none bg-blue-100/70 sm:h-80 lg:h-96" />
                            <div className="space-y-3 p-6">
                                <Skeleton className="h-6 w-40 rounded-full bg-blue-100/70" />
                                <Skeleton className="h-8 w-3/4 bg-blue-100/70" />
                                <Skeleton className="h-4 w-full bg-blue-100/70" />
                                <Skeleton className="h-4 w-5/6 bg-blue-100/70" />
                            </div>
                        </div>
                        <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-6">
                            <Skeleton className="h-5 w-48 bg-blue-100/70" />
                            <Skeleton className="mt-5 h-16 w-full rounded-xl bg-blue-100/70" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-white p-6">
                        <Skeleton className="h-4 w-24 bg-blue-100/70" />
                        <Skeleton className="mt-2 h-10 w-32 bg-blue-100/70" />
                        <div className="mt-6 space-y-4 border-t border-blue-50 pt-5">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-8 w-full bg-blue-100/70"
                                />
                            ))}
                        </div>
                        <Skeleton className="mt-6 h-12 w-full rounded-xl bg-blue-100/70" />
                    </div>
                </div>
            </div>
        </main>
    );
}
