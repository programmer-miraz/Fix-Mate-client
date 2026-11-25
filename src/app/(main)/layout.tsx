import Navbar from "@/components/navber";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* usePathname() in the navbar needs a boundary on dynamic routes. */}
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}
