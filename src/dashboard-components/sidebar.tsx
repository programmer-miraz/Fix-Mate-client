"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient, useSession } from "@/lib/auth-client"
import {
    Bookmark,
    Briefcase,
    BriefcaseBusiness,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    Loader2,
    LogOut,
    Plus,
    Settings,
    Users,
    Wrench,
    Building2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

// One menu item = id, name, url and an icon (lucide component)
type MenuItem = {
    id: number;
    name: string;
    url: string;
    icon: LucideIcon;
};

// Menu items for each role — the values must match the role saved at sign-up
const menuItemByRole: Record<string, MenuItem[]> = {
    customer: [
        { id: 1, name: "Deshboard", url: "/dashboard/customer", icon: LayoutDashboard },
        { id: 2, name: "bookings", url: "/dashboard/customer/bookings", icon: Briefcase },
        { id: 3, name: "payments", url: "/dashboard/customer/payments", icon: Bookmark },
        // { id: 4, name: "My Applications", url: "/dashboard/customer/application", icon: FileText },
        // { id: 5, name: "Billing", url: "/dashboard/customer/billing", icon: Receipt },
        // { id: 6, name: "Settings", url: "/dashboard/customer/settings", icon: Settings },
    ],
    technician: [
        { id: 1, name: "Deshboard", url: "/dashboard/technician", icon: LayoutDashboard },
        { id: 2, name: "add-services", url: "/dashboard/technician/add-services", icon: Plus },
        { id: 3, name: "my-services", url: "/dashboard/technician/my-services", icon: BriefcaseBusiness },
        { id: 4, name: "requests", url: "/dashboard/technician/requests", icon: ClipboardList },
        { id: 5, name: "Settings", url: "/dashboard/technician/settings", icon: Settings },
    ],
    admin: [
        { id: 1, name: "Deshboard", url: "/dashboard/admin", icon: LayoutDashboard },
        { id: 2, name: "Users", url: "/dashboard/admin/users", icon: Users },
        { id: 3, name: "services", url: "/dashboard/admin/services", icon: Building2 },
        { id: 4, name: "bookings", url: "/dashboard/admin/bookings", icon: Briefcase },
        { id: 5, name: "transactions", url: "/dashboard/admin/transactions", icon: CreditCard },
        { id: 6, name: "Settings", url: "/dashboard/admin/settings", icon: Settings },
    ]
}

export function Deshboard_Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, isPending } = useSession()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const role = (session?.user?.role || "customer") as keyof typeof menuItemByRole

    async function handleSignOut() {
        if (isSigningOut) return // prevent multiple clicks
        setIsSigningOut(true)

        try {
            await authClient.signOut()
            router.replace("/")
            router.refresh()
        } catch {
            // Let the user try again if sign out fails.
            setIsSigningOut(false)
        }
    }

    return (
        <Sidebar
            className="border-r border-blue-100 bg-white text-slate-700 shadow-sm"
            style={{
                // Match the FixMate white + blue + cyan design system.
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#0f172a",
                "--sidebar-primary": "#2563eb",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#eff6ff",
                "--sidebar-accent-foreground": "#1d4ed8",
                "--sidebar-border": "#dbeafe",
                "--sidebar-ring": "#3b82f6",
            } as React.CSSProperties}
        >
            {/* Brand */}
            <SidebarHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50/80 to-cyan-50/50 px-4 py-4">
                <Link href="/" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25">
                        <Wrench className="size-5" strokeWidth={2.2} />
                    </span>
                    <span>
                        <span className="block text-lg font-bold leading-tight tracking-tight text-slate-900">
                            Fix<span className="text-blue-600">Mate</span>
                        </span>
                        <span className="block text-[10px] font-medium tracking-wide text-slate-400">
                            Repair Dashboard
                        </span>
                    </span>
                </Link>
            </SidebarHeader>

            {/* Role-based menu — unchanged items and routes */}
            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Menu
                    </p>
                    <SidebarMenu>
                        {menuItemByRole[role].map((item) => (
                            <SidebarMenuItem key={item.id}>
                                <SidebarMenuButton
                                    render={<Link href={item.url} />}
                                    isActive={pathname === item.url}
                                    className="h-10 rounded-xl px-3 transition-all hover:shadow-sm data-[active=true]:font-semibold data-[active=true]:shadow-sm data-[active=true]:shadow-blue-500/10"
                                >
                                    <item.icon />
                                    <span>{item.name}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Sign out */}
            <SidebarFooter className="border-t border-blue-100 bg-gradient-to-r from-white to-blue-50/40 p-3">
                <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut || isPending}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:shadow-md disabled:opacity-50"
                >
                    {isSigningOut ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <LogOut className="size-4" />
                    )}
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}
