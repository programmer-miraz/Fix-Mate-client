"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
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
import { getDashboardPath, isValidEmail } from "@/lib/validation";

type FieldErrors = Record<string, string[]>;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  // Only allow local paths so the "redirect" parameter cannot send users away.
  const requestedPage =
    searchParams.get("redirect") ?? searchParams.get("callbackURL");
  const safeRedirect =
    requestedPage && requestedPage.startsWith("/") && !requestedPage.startsWith("//")
      ? requestedPage
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Logged-in users should not see the sign-in form.
  useEffect(() => {
    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      router.replace(safeRedirect ?? getDashboardPath(userRole));
    }
  }, [isPending, session, router, safeRedirect]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isGoogleLoading) return; // prevent double submit

    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = ["Email is required."];
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = ["Please enter a valid email address."];
    }

    if (!password) {
      nextErrors.password = ["Password is required."];
    }

    setErrors(nextErrors);
    setFormError("");
    setFormSuccess("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    // Better Auth checks the real credentials. We do not apply the sign-up
    // password rules here because existing users may have older passwords.
    authClient.signIn
      .email({ email: email.trim(), password })
      .then(async (result) => {
        if (result.error) {
          setFormError("Incorrect email or password. Please try again.");
          return;
        }

        setFormSuccess("Signed in successfully. Redirecting...");

        // Read the fresh session to find this user's role.
        const freshSession = await authClient.getSession();
        const userRole = (freshSession.data?.user as { role?: string } | undefined)
          ?.role;

        router.replace(safeRedirect ?? getDashboardPath(userRole));
      })
      .catch(() => {
        setFormError("Could not sign in. Please try again.");
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
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to manage your bookings and repair requests.
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

          {/* Password with show/hide button */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 transition hover:text-cyan-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password?.length)}
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
            {errors.password?.map((error) => (
              <FieldError key={error} message={error} />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-cyan-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

           {/* Google sign in */}
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
             
              className="h-12 w-full rounded-xl border-blue-200 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              Sign in with Google
            </Button>
          </> */}

      </CardContent>

      <CardFooter className="justify-center border-t border-blue-50 text-sm text-slate-500">
        Don&apos;t have an account?
        <Link
          href="/sign-up"
          className="ml-1 font-semibold text-blue-600 transition hover:text-cyan-600 hover:underline"
        >
          Sign Up
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
