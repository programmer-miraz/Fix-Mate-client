
import { connection } from "next/server";
import { AlertCircle, Sparkles, Wrench } from "lucide-react";

import ServiceCard from "@/components/home/ServiceCard";
import type { Service } from "@/components/home/service-types";

const MAX_SERVICES = 6;

function getServiceList(data: unknown): Service[] {
  if (Array.isArray(data)) return data as Service[];

  if (data && typeof data === "object") {
    const object = data as {
      services?: unknown;
      data?: unknown;
      result?: unknown;
    };

    for (const value of [object.services, object.data, object.result]) {
      if (Array.isArray(value)) return value as Service[];
    }
  }

  return [];
}

export default async function FeaturedServices() {
  // Request-time rendering
  await connection();

  const apiUrl = process.env.NEXT_PUBLIC_BETTER_AUTH;
  let services: Service[] = [];
  let hasError = false;

  if (!apiUrl) {
    hasError = true;
  } 
  else {
    try {
      const response = await fetch(`${apiUrl}/services`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: unknown = await response.json();
      services = getServiceList(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      hasError = true;
    }
  }

  const featuredServices = services
    .filter(
      (service) =>
        service.approvalStatus === "approved" &&
        service.isAvailable === true
    )
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )
    .slice(0, MAX_SERVICES);

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/40 to-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles className="size-3.5" />
            Featured Services
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Expert repairs for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              every device.
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Browse popular services from verified technicians and book the one
            that fits your needs.
          </p>
        </div>

        {hasError && (
          <div className="mx-auto mt-12 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
            <AlertCircle className="size-9 text-blue-500" />
            <p className="mt-4 text-base font-semibold text-slate-900">
              Services are temporarily unavailable
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Please try again in a little while.
            </p>
          </div>
        )}

        {!hasError && featuredServices.length === 0 && (
          <div className="mx-auto mt-12 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
            <Wrench className="size-9 text-blue-500" />
            <p className="mt-4 text-base font-semibold text-slate-900">
              No featured services yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              New approved services will appear here soon.
            </p>
          </div>
        )}

        {!hasError && featuredServices.length > 0 && (
          <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
