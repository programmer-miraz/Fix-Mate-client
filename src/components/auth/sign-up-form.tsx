"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  UserRound,
  Wrench,
} from "lucide-react";

import GoogleIcon from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  getDashboardPath,
  getPasswordErrors,
  isValidEmail,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string[]>;

export default function SignUpForm(){

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Logged-in users should not see the registration form.
  useEffect(() => {
    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      router.replace(getDashboardPath(userRole));
    }
  }, [isPending, session, router]);

  // Password rules are re-checked on every keystroke once the field is used.
  const passwordErrors = getPasswordErrors(password);
  const visiblePasswordErrors = showPasswordChecks ? passwordErrors : [];

  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isGoogleLoading) return; // prevent double submit

    const nextErrors: FieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = ["Full name is required."];
    }

    if (!email.trim()) {
      nextErrors.email = ["Email is required."];
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = ["Please enter a valid email address."];
    }

    if (passwordErrors.length > 0) {
      nextErrors.password = passwordErrors;
    }

    if (role !== "customer" && role !== "technician") {
      nextErrors.role = ["Please select a valid role."];
    }

    setShowPasswordChecks(true);
    setErrors(nextErrors);
    setFormError("");
    setFormSuccess("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    // Better Auth handles the real registration and session cookie.
     authClient.signUp.email({
       name: name.trim(),
        email: email.trim(),
        password,
        role,
      })
      .then((result) => {
        if (result.error) {
          setFormError(
            result.error.message ?? "Registration failed. Please try again."
          );
          return;
        }

        setFormSuccess("Account created successfully. Redirecting...");
        router.replace(getDashboardPath(role));
      })
      .catch(() => {
        setFormError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }


  if (isPending || session?.user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin text-blue-600" />
          Checking your session...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join FixMate and get your devices fixed by trusted experts.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {formError}
          </div>
        )}

        {formSuccess && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="e.g. Ahmed Khan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name?.length)}
              className="mt-1.5"
            />
            {errors.name?.map((error) => (
              <FieldError key={error} message={error} />
            ))}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email?.length)}
              className="mt-1.5"
            />
            {errors.email?.map((error) => (
              <FieldError key={error} message={error} />
            ))}
          </div>

          {/* Password with live validation and show/hide button */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setShowPasswordChecks(true);
                }}
                onBlur={() => setShowPasswordChecks(true)}
                aria-invalid={visiblePasswordErrors.length > 0}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {visiblePasswordErrors.length > 0 ? (
              <div className="mt-2 space-y-1">
                {visiblePasswordErrors.map((error) => (
                  <FieldError key={error} message={error} />
                ))}
              </div>
            ) : (
              showPasswordChecks && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Password meets all requirements.
                </p>
              )
            )}
          </div>

          {/* Role selection - admin is intentionally not offered */}
          <div>
            <Label>Register as</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <RoleCard
                title="Customer"
                description="Book repairs for your devices"
                icon={<UserRound className="size-5" />}
                isSelected={role === "customer"}
                onSelect={() => setRole("customer")}
              />
              <RoleCard
                title="Technician"
                description="Offer your repair services"
                icon={<Wrench className="size-5" />}
                isSelected={role === "technician"}
                onSelect={() => setRole("technician")}
              />
            </div>
            {errors.role?.map((error) => (
              <FieldError key={error} message={error} />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-cyan-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

       {/* google signIn */}
          {/* <>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-blue-100" />
              <span className="text-[11px] font-semibold tracking-wider text-slate-400">
                OR CONTINUE WITH
              </span>
              <span className="h-px flex-1 bg-blue-100" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isGoogleLoading}
              onClick={handleGoogleSignUp}
              className="h-12 w-full rounded-xl border-blue-200 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              Sign up with Google
            </Button>
          </> */}
 
      </CardContent>

      <CardFooter className="justify-center border-t border-blue-50 text-sm text-slate-500">
        Already have an account?
        <Link
          href="/sign-in"
          className="ml-1 font-semibold text-blue-600 transition hover:text-cyan-600 hover:underline"
        >
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

// Small helper for a consistent error message style.
function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </p>
  );  
}

// One selectable radio card for the role choice.
function RoleCard({
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md",
        isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-blue-100 bg-white"
      )}
    >
      <input
        type="radio"
        name="role"
        value={title.toLowerCase()}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className={cn(isSelected ? "text-blue-600" : "text-slate-400")}>
        {icon}
      </span>
      <span className="mt-2 block text-sm font-semibold text-slate-800">
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
    </label>
  );
}
