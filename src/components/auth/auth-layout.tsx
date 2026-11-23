import { BadgeCheck, Clock3, Loader2, ShieldCheck, Star, Wrench } from "lucide-react";

// Shared two-column shell for the sign-in and sign-up pages.
// On small screens only the form column is shown.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1">
      {/* Promotional panel - desktop only */}
      <section className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Wrench className="size-5" />
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Fix<span className="text-cyan-100">Mate</span>
          </span>
        </div>

        <div className="relative my-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Expert repairs, without the hassle.
          </h2>
          <p className="mt-4 text-base leading-7 text-blue-50">
            Join thousands of customers who trust FixMate to get their devices
            fixed quickly and affordably.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Verified technicians</p>
                <p className="text-xs text-blue-50">Every expert is checked and rated</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Clock3 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Book in seconds</p>
                <p className="text-xs text-blue-50">Pick a time that works for you</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Pay after the repair</p>
                <p className="text-xs text-blue-50">No upfront payment required</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex max-w-sm items-center gap-3 rounded-2xl border border-white/30 bg-white/15 p-4 backdrop-blur-md">
          <div className="flex text-amber-300">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-4 fill-current" />
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold">4.9/5 from happy customers</p>
            <p className="text-xs text-blue-50">Trusted across all repair categories</p>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex w-full items-center justify-center bg-gradient-to-b from-blue-50/70 via-white to-white px-4 py-10 sm:px-6 lg:w-1/2 lg:py-14">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          {children}
        </div>
      </section>
    </main>
  );
}

// Shown while the form's session / search-param hooks are loading.
export function AuthFormFallback() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-xl shadow-blue-900/5">
      <Loader2 className="mx-auto size-5 animate-spin text-blue-600" />
      <p className="mt-3 text-sm text-slate-500">Loading form...</p>
    </div>
  );
}
