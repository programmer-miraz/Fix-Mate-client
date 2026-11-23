import type { Metadata } from "next";
import { Suspense } from "react";

import AuthLayout, { AuthFormFallback } from "@/components/auth/auth-layout";
import SignInForm from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | FixMate",
  description: "Sign in to your FixMate account to manage your repair bookings.",
};

export default function SignInPage() {

  return (
    <AuthLayout>
      <Suspense fallback={<AuthFormFallback />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
