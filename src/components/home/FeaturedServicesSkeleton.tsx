import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the real section layout so there is no jump when data arrives.
export default function FeaturedServicesSkeleton() {
  return (
    <section className="bg-gradient-to-b from-white via-blue-50/40 to-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-6 w-36 rounded-full" />
          <Skeleton className="mx-auto mt-5 h-9 w-3/4" />
          <Skeleton className="mx-auto mt-3 h-8 w-2/3" />
          <Skeleton className="mx-auto mt-5 h-4 w-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-4/5" />
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-900/5"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="mt-5 h-5 w-4/5" />
              <Skeleton className="mt-3 h-4 w-1/3 rounded-full" />
              <Skeleton className="mt-5 h-6 w-24" />
              <Skeleton className="mt-5 h-4 w-2/3" />
              <Skeleton className="mt-5 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
