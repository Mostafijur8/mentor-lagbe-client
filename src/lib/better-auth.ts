import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME ?? "mentorLagbe";

const mongoClient = new MongoClient(mongoUri);
export const authDatabase = mongoClient.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(authDatabase, {
    client: mongoClient,
    transaction: false,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      // Students and tutors pick their role at sign-up; the create hook below
      // prevents anyone from self-registering as an admin.
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      // Plan and bookmarks are owned by the Express API, never by the client.
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      savedTuitions: {
        type: "string[]",
        required: false,
        defaultValue: [],
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "tutor" ? "tutor" : "student",
            plan: "free",
            savedTuitions: [],
          },
        }),
      },
    },
  },
});
