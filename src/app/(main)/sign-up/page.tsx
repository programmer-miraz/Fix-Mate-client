import type { Metadata } from "next";
import { Suspense } from "react";

import AuthLayout, { AuthFormFallback } from "@/components/auth/auth-layout";
import SignUpForm from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up | FixMate",
  description: "Create your FixMate account as a customer or technician.",
};

export default function SignUpPage() {
  // The page is a Server Component, so it can check the server-only env vars.


  return (
    <AuthLayout>
      <Suspense fallback={<AuthFormFallback />}>
        <SignUpForm/>
      </Suspense>
    </AuthLayout>
  );
}
