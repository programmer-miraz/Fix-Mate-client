"use client"
import { getDashboardPath } from "@/lib/validation";
import { cn } from "cn";
import { ChevronDown, LayoutDashboard, Loader2, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// Turn "Ahmed Khan" into "AK" when a user has no profile image.
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

// Small color chip for the user's role inside the dropdown.
function getRoleBadgeClass(role?: string | null) {
  if (role === "technician") return "bg-cyan-50 text-cyan-700";
  if (role === "admin") return "bg-indigo-50 text-indigo-700";
  return "bg-blue-50 text-blue-700";
}

type AccountUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};
function AccountMenu({user,onSignOut,isSigningOut}: {user: AccountUser;onSignOut: () => void;isSigningOut: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the user clicks anywhere outside of it.
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const dashboardPath = getDashboardPath(user.role);
  const roleLabel = getRoleLabel(user.role);

  return (
    <div className="relative cursor-pointer" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-white py-0.5 pl-0.5 pr-1.5 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "Profile image"}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-semibold text-white">
            {getUserInitials(user.name, user.email)}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-3.5 text-slate-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full cursor-pointer z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-right animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10 duration-200"
        >
          {/* User information */}
          <div className="border-b border-blue-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name || "FixMate User"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <span
              className={cn(
                "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                getRoleBadgeClass(user.role)
              )}
            >
              {roleLabel}
            </span>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <Link
              href={dashboardPath}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <LayoutDashboard className="size-4 text-blue-600" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <UserRound className="size-4 text-blue-600" />
              Update Profile
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-blue-50 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {isSigningOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default AccountMenu;