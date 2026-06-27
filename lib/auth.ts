import * as schema from "@/db/schema";
import { customers } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { admin } from "better-auth/plugins";
import { sql } from "drizzle-orm";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["admin", "user"],
        input: false,
        defaultValue: "user",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Every auth user gets a matching `customers` row the moment they
        // register, so the rest of the app can assume it exists. If a guest
        // customer already used this email at checkout, link it to the new
        // user instead of creating a duplicate.
        after: async (user) => {
          await db
            .insert(customers)
            .values({
              userId: user.id,
              name: user.name,
              email: user.email,
            })
            .onConflictDoUpdate({
              target: customers.email,
              set: {
                userId: sql`coalesce(${customers.userId}, excluded.user_id)`,
                updatedAt: new Date(),
              },
            });
        },
      },
    },
  },
  plugins: [admin()],
  advanced: {
    database: {
      generateId: false,
    },
  },
});
