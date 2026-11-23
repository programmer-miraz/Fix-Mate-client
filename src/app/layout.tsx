import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixMate | Trusted Device & Appliance Repair Services",
  description:
    "Find verified technicians for smartphone, laptop, AC and refrigerator repairs. Book easily and pay only after your repair is completed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Suspense keeps the pathname-aware navbar safe on future dynamic routes. */}
        <Suspense fallback={<div className="h-16" />}>
        </Suspense>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
