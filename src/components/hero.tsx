"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Laptop,
  Refrigerator,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Soft decorative background shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-blue-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-cyan-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
        {/* Left column: heading, search and buttons */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles className="size-3.5" />
            Trusted repair experts, right near you
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            Broken Device? Get It Fixed by{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Verified Technicians.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Find trusted repair experts for your smartphones, laptops, ACs,
            refrigerators, and more. Book easily and pay only after your repair
            is completed.
          </p>

          {/* Search field and primary button */}
          <form
            className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Search repair services"
                placeholder="What needs fixing? Try laptop screen"
                className="h-12 w-full rounded-xl border border-blue-100 bg-white pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-cyan-600"
            >
              <Search className="size-4" />
              Search Services
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/services"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "h-11 rounded-xl border-blue-200 bg-white px-5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50",
              })}
            >
              Explore Services
              <ArrowRight className="size-4" />
            </Link>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="size-4 text-cyan-600" />
              No upfront payment required
            </p>
          </div>

          {/* Quick trust signals */}
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-blue-100 pt-6 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-600" />
              Verified technicians
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-5 text-cyan-600" />
              Fast booking
            </span>
            <span className="flex items-center gap-2">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              4.9/5 customer rating
            </span>
          </div>
        </div>

        {/* Right column: repair illustration made from icons, so no image file is needed */}
        <div className="animate-in fade-in slide-in-from-bottom-6 delay-150 duration-700 fill-mode-both">
          <div className="relative mx-auto w-full max-w-lg">
            {/* Glow behind the card */}
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-tr from-blue-200/70 to-cyan-200/60 blur-2xl"
            />

            <div className="relative rounded-3xl border border-white bg-white p-5 shadow-2xl shadow-blue-900/10 sm:p-6">
              {/* Simple browser-style header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-medium tracking-wide text-slate-400">
                  fixmate / live booking
                </span>
              </div>

              {/* Device and tools on a blue-cyan gradient */}
              <div className="relative mt-5 flex h-60 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 sm:h-72">
                <div
                  aria-hidden="true"
                  className="absolute -left-12 -top-12 size-44 rounded-full bg-white/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-16 -right-10 size-56 rounded-full bg-white/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute right-6 top-6 size-16 rounded-full border border-white/20"
                />

                <div className="relative flex items-center gap-3 sm:gap-5">
                  <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur-sm">
                    <Smartphone
                      className="size-20 text-white sm:size-24"
                      strokeWidth={1.2}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                      <Wrench className="size-7 text-white" />
                    </div>
                    <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                      <Laptop className="size-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Two small summary cards */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                    <BadgeCheck className="size-4" /> Verified
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Background-checked pros
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700">
                    <Star className="size-4 fill-cyan-500 text-cyan-500" /> 4.9/5
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    From happy customers
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="animate-float absolute -right-3 -top-5 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-white px-3 py-2.5 shadow-lg shadow-blue-900/10">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Repair confirmed
                </p>
                <p className="text-[11px] text-slate-500">
                  Technician on the way
                </p>
              </div>
            </div>

            <div
              className="animate-float absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-xl border border-cyan-100 bg-white px-3 py-2.5 shadow-lg shadow-blue-900/10"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Clock3 className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Quick response
                </p>
                <p className="text-[11px] text-slate-500">Under 15 minutes</p>
              </div>
            </div>

            {/* Small appliance icon */}
            <div
              aria-hidden="true"
              className="animate-float absolute right-8 top-1/3 hidden size-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600 shadow-md sm:flex"
              style={{ animationDelay: "0.6s" }}
            >
              <Refrigerator className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
