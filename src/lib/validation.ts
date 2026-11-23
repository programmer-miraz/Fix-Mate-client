// Small validation helpers shared by the sign-in / sign-up forms and the server.

/** Check the three password rules required by the assignment. */
export function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  return errors;
}

/** Simple email format check for the form (Better Auth also checks this). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Send each user to the dashboard that matches their role. */
export function getDashboardPath(role?: string | null): string {
  if (role === "technician") return "/dashboard/technician";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}
