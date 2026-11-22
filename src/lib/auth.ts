import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { sendMail } from "./mail";

const client = new MongoClient(process.env.DATABASE_URL!);
const db = client.db();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your WedPlan password",
        text: `Hello ${user.name || "there"},\n\nClick the link below to reset your WedPlan password:\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1c1917; background-color: #ffffff;">
            <h2 style="font-size: 22px; font-weight: 700; color: #0c0a09; margin-bottom: 16px;">Reset your password</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Hello ${user.name || "there"},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">We received a request to reset the password for your WedPlan account. Click the button below to choose a new password:</p>
            <div style="margin: 28px 0;">
              <a href="${url}" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #78716c;">If the button does not work, copy and paste this link into your browser:<br/><a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a></p>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 28px 0;" />
            <p style="font-size: 12px; color: #a8a29e;">If you did not request a password reset, please ignore this email.</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your WedPlan email address",
        text: `Hello ${user.name || "there"},\n\nThank you for signing up for WedPlan! Please verify your email by clicking the link below:\n${url}\n\nIf you did not create an account, you can safely ignore this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1c1917; background-color: #ffffff;">
            <h2 style="font-size: 22px; font-weight: 700; color: #0c0a09; margin-bottom: 16px;">Verify your email address</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Hello ${user.name || "there"},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">Welcome to WedPlan! Please verify your email address to confirm your registration and activate your account:</p>
            <div style="margin: 28px 0;">
              <a href="${url}" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #78716c;">If the button does not work, copy and paste this link into your browser:<br/><a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a></p>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 28px 0;" />
            <p style="font-size: 12px; color: #a8a29e;">If you did not create an account with WedPlan, please ignore this email.</p>
          </div>
        `,
      });
    },
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
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
