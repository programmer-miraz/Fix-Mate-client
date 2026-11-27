
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH

type Payment = {
    amount: number;
    transactionId: string;
};

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError("Payment session not found.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(
                    `${BASE_URL}/api/payments/verify?session_id=${sessionId}`
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Payment verification failed");
                }

                setPayment(data.payment);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    if (loading) {
        return <div className="py-20 text-center">Verifying payment...</div>;
    }

    if (error || !payment) {
        return <div className="py-20 text-center text-red-500">{error || "Payment not found"}</div>;
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-lg">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />

                <h1 className="text-2xl font-bold">Payment Successful!</h1>

                <p className="mt-2 text-gray-500">
                    Your payment has been completed successfully.
                </p>

                <div className="mt-6 space-y-3 rounded-xl bg-gray-50 p-4 text-left">
                    <p>
                        <strong>Amount:</strong> ${payment.amount}
                    </p>
                    <p className="break-all">
                        <strong>Transaction ID:</strong> {payment.transactionId}
                    </p>
                </div>

                <Link
                    href="/dashboard/customer/bookings"
                    className="mt-6 inline-block w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                    Back to My Bookings
                </Link>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="py-20 text-center">
                    Verifying payment...
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}