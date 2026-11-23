"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// Same avatar initials logic as the public navbar.
function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function getRoleLabel(role?: string | null) {
  if (role === "technician") return "Technician";
  if (role === "admin") return "Admin";
  return "Customer";
}

function getRoleBadgeClass(role?: string | null) {
  if (role === "technician") return "bg-cyan-50 text-cyan-700";
  if (role === "admin") return "bg-indigo-50 text-indigo-700";
  return "bg-blue-50 text-blue-700";
}

// Top bar: the user profile is shown on the right; sign out stays in the sidebar footer.
export default function DashboardNavbar() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  return (
    <header className="relative sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 sm:px-6">
      {/* Thin blue-cyan accent line, matching the public navbar theme */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-cyan-400/0"
      />

      {/* Left: sidebar toggle + title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="size-9 cursor-pointer rounded-lg border border-blue-100 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-700" />
        <span className="hidden h-5 w-px bg-blue-100 sm:block" />
        <span className="hidden size-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 sm:block" />
        <h1 className="hidden text-base font-semibold tracking-tight text-slate-900 sm:block">
          Dashboard
        </h1>
      </div>

      {/* Right: name / email / role to the left of the avatar */}
      <div className="flex items-center gap-3">
        {isPending ? (
          <div className="flex items-center gap-3" aria-label="Loading profile">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 bg-blue-100 sm:w-28" />
              <Skeleton className="hidden h-3 w-36 bg-blue-100 sm:block" />
            </div>
            <Skeleton className="size-9 rounded-full bg-blue-100" />
          </div>
        ) : (
          user && (
            <>
              <div className="min-w-0 text-right">

                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name || "FixMate User"}
                </p>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {user.email}
                </p>
              </div>

              <div>
                <span
                  className={cn(
                    "mt-1 hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex",
                    getRoleBadgeClass(user.role)
                  )}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
              {/* Avatar on the far right */}
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Profile image"}
                  className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-md shadow-blue-500/20"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-semibold text-white ring-2 ring-white shadow-md shadow-blue-500/20">
                  {getUserInitials(user.name, user.email)}
                </span>
              )}
            </>
          )
        )}
      </div>
    </header>
  );
}
