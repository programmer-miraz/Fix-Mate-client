"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/validation";
import { cn } from "@/lib/utils";
import AccountMenu from "./accountMenu";

// All nav links live here so the desktop and mobile menus always stay in sync.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];



export default function Navbar() {
  // usePathname tells us the current page so we can highlight its link.
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Better Auth session: isPending avoids showing logged-out buttons too early.
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    if (isSigningOut) return; // prevent double click
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      setIsMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      // Keep the menu open so the user can try again.
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0  z-50 w-full border-b border-blue-100/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className=" mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25">
            <Wrench className="size-5" strokeWidth={2.2} />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Fix<span className="text-blue-600">Mate</span>
          </span>
        </Link>

        {/* Desktop navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700",
                  // Highlight the link for the page the user is on.
                  isActive && "bg-blue-50 text-blue-700"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Logged-out buttons: same styles and links as before */}
          {!isPending && !session?.user && (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "h-9 px-4 text-slate-700 hover:text-blue-700",
                })}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "sm",
                  className:
                    "h-9 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600",
                })}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Session check in progress: show a small skeleton, never the buttons */}
          {isPending && (
            <div className="flex items-center gap-2" aria-label="Loading account">
              <span className="size-8 animate-pulse rounded-full bg-blue-100" />
              <span className="hidden size-3 animate-pulse rounded-full bg-blue-100 sm:block" />
            </div>
          )}

          {/* Logged-in avatar with dropdown */}
          {session?.user && (
            <AccountMenu
              user={session.user}
              onSignOut={handleSignOut}
              isSigningOut={isSigningOut}

            />
          )}

          {/* Hamburger button, only visible on small screens */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-slate-700 cursor-pointer md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu, shown only when the hamburger button is clicked */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-blue-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700",
                    isActive && "bg-blue-50 text-blue-700"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!isPending &&
            (session?.user ? (
              // Logged-in users get quick links in the mobile menu.
              <div className="mt-4 flex flex-col gap-1 border-t border-blue-100 pt-4">
                <Link
                  href={getDashboardPath(session.user.role)}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <LayoutDashboard className="size-4 text-blue-600" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <UserRound className="size-4 text-blue-600" />
                  Update Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {isSigningOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t border-blue-100 pt-4">
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "h-10 border-blue-200 text-blue-700 hover:bg-blue-50",
                  })}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className={buttonVariants({
                    className:
                      "h-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600",
                  })}
                >
                  Sign Up
                </Link>
              </div>
            ))}
        </div>
      )}
    </header>
  );
}

// Avatar button and its dropdown menu. Kept in this file so the rest of the
// navbar stays untouched.

