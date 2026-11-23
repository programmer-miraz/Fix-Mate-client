import { ServiceData } from "@/app/dashboard/technician/add-services/type";

// Use the project's existing backend URL. NEXT_PUBLIC_BETTER_AUTH already points
// to the Express server, so it is used as a fallback when the other variable is absent.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BETTER_AUTH;

export const createService = async (data: ServiceData) => {
  const res = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Could not save the service. Please try again.");
  }

  return res.json();
};
