
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-lg">

                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />

                <h1 className="text-2xl font-bold">
                    Payment Cancelled
                </h1>

                <p className="mt-2 text-gray-500">
                    Your payment was cancelled. Don&#39;t worry, no amount has been charged.
                </p>

                <Link
                    href="/dashboard/customer/bookings"
                    className="mt-6 inline-block w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                      ok
                </Link>

            </div>
        </div>
    );
}
