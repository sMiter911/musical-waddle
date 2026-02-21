import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { logActivity } from "./actions/activity";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["facebook", "google"],
            allowDifferentEmails: true,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Create Member record immediately for new users
                    await prisma.member.create({
                        data: {
                            userId: user.id,
                            firstName: user.name.split(" ")[0] || "User",
                            lastName: user.name.split(" ").slice(1).join(" ") || "",
                            avatarUrl: user.image, // Sync social image to avatar
                        }
                    });

                    await logActivity({
                        userId: user.id,
                        type: "MEMBER",
                        action: "signed up as a new member",
                    });
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                // Optional: update profile on each login
                // overrideProfile: true  
            }
        } : {}),
        ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? {
            facebook: {
                clientId: process.env.FACEBOOK_CLIENT_ID!,
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            }
        } : {}),
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
        },
    },
});
