"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Home, Store, UserRound, Wrench } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Service } from "@/components/home/service-types";

export default function ServiceCard({ service }: { service: Service }) {
  const [imageFailed, setImageFailed] = useState(false);

  // Safe fallbacks in case a field is missing in the database.
  const title = service.title || "Repair service";
  const category = service.category || "General";
  const technician = service.technicianName || "FixMate expert";
  const price = Number(service.basePrice);
  const formattedPrice = Number.isFinite(price) ? `$${price.toFixed(2)}` : "$0.00";
  const isHomeVisit = service.serviceMode === "Home Visit";

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
      {/* Service image with a fixed height so all cards line up */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-50">
        {service.image && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={title}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Wrench className="size-10 text-blue-400" />
          </div>
        )}

        {/* Category chip */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
          {category}
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900">
          {title}
        </h3>

        {/* Service mode */}
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {isHomeVisit ? (
            <Home className="size-3.5 text-cyan-600" />
          ) : (
            <Store className="size-3.5 text-blue-600" />
          )}
          {service.serviceMode || "Service"}
        </p>

        {/* Starting price */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-xs text-slate-500">Starting at</span>
          <span className="text-xl font-bold text-blue-600">{formattedPrice}</span>
        </div>

        {/* Technician */}
        <p className="mt-3 flex items-center gap-1.5 border-t border-blue-50 pt-3 text-xs text-slate-500">
          <UserRound className="size-3.5 text-blue-500" />
          By <span className="font-medium text-slate-700">{technician}</span>
        </p>

        {/* View details */}
        <Link
          href={`/services/${service._id}`}
          className={buttonVariants({
            className:
              "mt-auto h-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600",
          })}
        >
          View Details
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
