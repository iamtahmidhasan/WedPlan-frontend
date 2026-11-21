import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        defaultValue: "customer",
        transform: {
          input: (value) => (value === "vendor" ? "vendor" : "customer"),
        },
      },
      isBlocked: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
      isPremium: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
      businessName: {
        type: "string",
        input: true,
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID as string) || "",
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string) || "",
    },
    github: {
      clientId: (process.env.GITHUB_CLIENT_ID as string) || "",
      clientSecret: (process.env.GITHUB_CLIENT_SECRET as string) || "",
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
