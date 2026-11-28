"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    Loader2,
    RefreshCw,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { useSession } from "@/lib/auth-client";

import { cn } from "@/lib/utils";
import { getAllUsers } from "@/lib/api/get-services";
import { updateUserRole } from "@/lib/mutions-api/services";

// Better Auth user document fields used on this page.
type AdminUser = {
    _id: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: string;
    createdAt?: string;
};

type RoleChange = {
    user: AdminUser;
    role: string;
};

type UpdateResult = {
    success?: boolean;
    message?: string;
};

const roles = ["customer", "technician", "admin"];

function roleStyle(role?: string) {
    if (role === "admin")
        return "border border-purple-200 bg-purple-50 text-purple-700";
    if (role === "technician")
        return "border border-cyan-200 bg-cyan-50 text-cyan-700";
    return "border border-blue-200 bg-blue-50 text-blue-700";
}

function formatDate(value?: string) {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not set";
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name?: string, email?: string) {
    const source = name?.trim() || email?.trim() || "User";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
}

export default function AdminUsersContent() {
    const { data: session, isPending } = useSession();
    const adminEmail = session?.user?.email;

    const [users, setUsers] = useState<AdminUser[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [pendingChange, setPendingChange] = useState<RoleChange | null>(null);
    const [updatingId, setUpdatingId] = useState("");
    const [activeRoleFilter, setActiveRoleFilter] = useState("all");

    const loadUsers = useCallback(async () => {
        try {
            const result = await getAllUsers();
            setUsers(Array.isArray(result) ? (result as AdminUser[]) : []);
        } catch {
            setUsers([]);
            setErrorMessage("Could not load users. Please try again.");
            toast.error("Could not load users. Please try again.");
        }
    }, []);

    useEffect(() => {
        if (isPending || !adminEmail) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, [isPending, adminEmail, loadUsers]);

    const isLoading = isPending || users === null;
    const allUsers = users ?? [];

    // Counts and filtering for the role tabs shown above the list.
    const roleTabs = [
        { key: "all", label: "All" },
        { key: "customer", label: "Customers" },
        { key: "technician", label: "Technicians" },
        { key: "admin", label: "Admins" },
    ];

    function userCount(roleKey: string) {
        if (roleKey === "all") return allUsers.length;
        return allUsers.filter((user) => (user.role || "customer") === roleKey).length;
    }

    const visibleUsers =
        activeRoleFilter === "all"
            ? allUsers
            : allUsers.filter(
                (user) => (user.role || "customer") === activeRoleFilter
            );

    async function confirmRoleChange() {
        if (!pendingChange || !adminEmail || updatingId) return;
        setUpdatingId(pendingChange.user._id);

        try {
            const result = (await updateUserRole(
                pendingChange.user._id,
                pendingChange.role,
                adminEmail
            )) as UpdateResult;

            if (!result || result.success !== true) {
                throw new Error(result?.message || "Could not update the user role.");
            }

            toast.success("User role updated successfully.");
            setPendingChange(null);
            await loadUsers();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not update the user role."
            );
        } finally {
            setUpdatingId("");
        }
    }

    function isCurrentAdmin(user: AdminUser) {
        return (
            Boolean(adminEmail) &&
            user.email?.toLowerCase() === adminEmail?.toLowerCase()
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Manage Users
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    View registered users and manage their roles.
                </p>

                </div>

                <div className="mt-6 hidden md:flex flex-wrap gap-1 rounded-xl border w-fit border-blue-100 bg-white p-1 shadow-sm">
                    {roleTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveRoleFilter(tab.key)}
                            className={cn(
                                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                                activeRoleFilter === tab.key
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            )}
                        >
                            {tab.label} <span className="opacity-75">{userCount(tab.key)}</span>
                        </button>
                    ))}
                </div>

            </div>
                <div className="mt-6 flex flex-wrap sm:hidden  gap-1 rounded-xl border w-fit border-blue-100 bg-white p-1 shadow-sm">
                    {roleTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveRoleFilter(tab.key)}
                            className={cn(
                                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                                activeRoleFilter === tab.key
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            )}
                        >
                            {tab.label} <span className="opacity-75">{userCount(tab.key)}</span>
                        </button>
                    ))}
                </div>

            {/* Role filter tabs */}


            {/* Loading */}
            {isLoading && (
                <div className="mt-8 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-16 w-full rounded-2xl bg-blue-100/70"
                        />
                    ))}
                </div>
            )}

            {/* Error / empty */}
            {!isLoading && errorMessage && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <AlertCircle className="size-9 text-red-500" />
                    <p className="mt-4 font-semibold text-slate-900">
                        Could not load users
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                    <Button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            loadUsers();
                        }}
                        className="mt-5 h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white"
                    >
                        <RefreshCw className="size-4" />
                        Retry
                    </Button>
                </div>
            )}

            {!isLoading && !errorMessage && allUsers.length === 0 && (
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-12 text-center shadow-lg shadow-blue-900/5">
                    <Users className="mx-auto size-10 text-blue-500" />
                    <p className="mt-4 font-semibold text-slate-900">No users found</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Registered users will appear here.
                    </p>
                </div>
            )}

            {/* Filter empty */}
            {!isLoading &&
                !errorMessage &&
                allUsers.length > 0 &&
                visibleUsers.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-lg shadow-blue-900/5">
                        <p className="font-semibold text-slate-900">
                            No users with this role
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Choose another tab to see your registered users.
                        </p>
                    </div>
                )}

            {/* Desktop table */}
            {!isLoading && !errorMessage && allUsers.length > 0 && (
                <div className="mt-8 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5 md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-blue-100 bg-blue-50/60">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Registered</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {visibleUsers.map((user) => {
                                const isSelf = isCurrentAdmin(user);
                                const currentRole = user.role || "customer";

                                return (
                                    <tr key={user._id} className="transition hover:bg-blue-50/40">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={user.image}
                                                        alt={user.name || "User"}
                                                        className="size-9 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-semibold text-white">
                                                        {getInitials(user.name, user.email)}
                                                    </span>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="flex items-center gap-2 font-semibold text-slate-800">
                                                        <span className="truncate">
                                                            {user.name || "FixMate User"}
                                                        </span>
                                                        {isSelf && (
                                                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                                You
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        {user.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", roleStyle(currentRole))}>
                                                {currentRole}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-5 py-3">
                                            {isSelf ? (
                                                <span className="text-xs text-slate-400">
                                                    Cannot change your own role
                                                </span>
                                            ) : (
                                                <select
                                                    aria-label={`Change role for ${user.name || user.email}`}
                                                    value={currentRole}
                                                    disabled={updatingId === user._id}
                                                    onChange={(event) => {
                                                        const nextRole = event.target.value;
                                                        if (nextRole !== currentRole) {
                                                            setPendingChange({ user, role: nextRole });
                                                        }
                                                    }}
                                                    className="h-9 cursor-pointer rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                                                >
                                                    {roles.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile cards */}
            {!isLoading && !errorMessage && allUsers.length > 0 && (
                <div className="mt-6 space-y-3 md:hidden">
                    {visibleUsers.map((user) => {
                        const isSelf = isCurrentAdmin(user);
                        const currentRole = user.role || "customer";

                        return (
                            <Card key={user._id} className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        {user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={user.image}
                                                alt={user.name || "User"}
                                                className="size-10 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-semibold text-white">
                                                {getInitials(user.name, user.email)}
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="flex items-center gap-2 truncate font-semibold text-slate-900">
                                                {user.name || "FixMate User"}
                                                {isSelf && (
                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {user.email || "No email"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-blue-50 pt-3">
                                        <div>
                                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", roleStyle(currentRole))}>
                                                {currentRole}
                                            </span>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Joined {formatDate(user.createdAt)}
                                            </p>
                                        </div>
                                        {isSelf ? (
                                            <span className="text-[11px] text-slate-400">
                                                Your account
                                            </span>
                                        ) : (
                                            <select
                                                aria-label={`Change role for ${user.name || user.email}`}
                                                value={currentRole}
                                                disabled={updatingId === user._id}
                                                onChange={(event) => {
                                                    const nextRole = event.target.value;
                                                    if (nextRole !== currentRole) {
                                                        setPendingChange({ user, role: nextRole });
                                                    }
                                                }}
                                                className="h-9 cursor-pointer rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                                            >
                                                {roles.map((role) => (
                                                    <option key={role} value={role}>
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Confirmation dialog */}
            <Dialog
                open={Boolean(pendingChange)}
                onOpenChange={(open) => !open && !updatingId && setPendingChange(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change user role?</DialogTitle>
                        <DialogDescription>
                            {pendingChange && (
                                <>
                                    Change{" "}
                                    <span className="font-semibold text-slate-800">
                                        {pendingChange.user.name || pendingChange.user.email}
                                    </span>{" "}
                                    from{" "}
                                    <span className="capitalize">
                                        {pendingChange.user.role || "customer"}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-semibold capitalize text-blue-700">
                                        {pendingChange.role}
                                    </span>
                                    ?
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-slate-600">
                        <ShieldCheck className="size-4 shrink-0 text-blue-600" />
                        You cannot change your own role. Other admins can be changed.
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPendingChange(null)}
                            disabled={Boolean(updatingId)}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmRoleChange}
                            disabled={Boolean(updatingId)}
                            className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
                        >
                            {updatingId ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <UserRound className="size-4" />
                            )}
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
