import { APIError, betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { getPasswordErrors } from "@/lib/validation";

const client = new MongoClient(process.env.MONGO_DB_CLIENT_URI as string);
const db = client.db("Fix-mate");

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    // FixMate only requires 6 characters, plus the rules checked below.
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {

      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
      },
    },
  },

  hooks: {
    // Server-side validation: the client can be bypassed, so check here too.
    before: async (context) => {
      const hookContext = context as unknown as {
        path?: string;
        body?: { password?: string; role?: string };
      };

      if (hookContext.path !== "/sign-up/email") return;

      const passwordErrors = getPasswordErrors(hookContext.body?.password ?? "");
      if (passwordErrors.length > 0) {
        throw new APIError("BAD_REQUEST", {
          message: passwordErrors.join(" "),
        });
      }

      const role = hookContext.body?.role;
      if (role !== "customer" && role !== "technician") {
        throw new APIError("BAD_REQUEST", {
          message: "Please select a valid role.",
        });
      }
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
