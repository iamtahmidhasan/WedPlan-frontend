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
        type: ["vendor", "customer", "admin"],
        input: true,
        defaultValue: "customer",
      },
      isBlocked: {
        type: "boolean",
        input: true,
        defaultValue: false,
      },
      isPremium: {
        type: "boolean",
        input: true,
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
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
