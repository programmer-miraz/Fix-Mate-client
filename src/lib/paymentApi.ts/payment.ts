
const BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH

export const handlePayment = async (bookingId: string) => {
    try {
        const res = await fetch(
            `${BASE_URL}/api/payments/create-checkout-session`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookingId }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Payment failed");
        }

        window.location.href = data.url;

    } catch (error) {
        console.error("Payment Error:", error);
    }
};
