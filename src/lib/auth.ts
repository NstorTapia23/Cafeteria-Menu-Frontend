import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: false,
    requireEmailVerification: false,
  },

  password: {
    enabled: true,
    minPasswordLength: 6,
  },

  plugins: [username()],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "dependiente",
      },
      deletedAt: {
        type: "date",
        required: false,
      },
    },
  },
});
