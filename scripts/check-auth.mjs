import { readFileSync } from "fs";
import { MongoClient } from "mongodb";
import { verifyPassword } from "better-auth/crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const client = new MongoClient(env.MONGODB_URI);
await client.connect();
const db = client.db(env.DB_NAME);
const admin = await db.collection("user").findOne({ email: "admin@mentorlagbe.com" });
console.log("admin", admin && {
  id: admin._id,
  role: admin.role,
  plan: admin.plan,
  emailVerified: admin.emailVerified,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});
const accounts = await db.collection("account").find({ userId: admin?._id }).toArray();
console.log("admin accounts", accounts.map((a) => ({
  providerId: a.providerId,
  accountId: a.accountId,
  hasPassword: Boolean(a.password),
})));
for (const account of accounts) {
  if (account.password) {
    console.log("admin password valid:", await verifyPassword({ hash: account.password, password: "Admin12345!" }));
  }
}

const rahim = await db.collection("user").findOne({ email: "rahim.tutor@example.com" });
const rahimAccount = await db.collection("account").findOne({ userId: rahim?._id, providerId: "credential" });
console.log("rahim", rahim && { id: rahim._id, role: rahim.role, plan: rahim.plan });
console.log("rahim password valid:", rahimAccount ? await verifyPassword({ hash: rahimAccount.password, password: "Password123!" }) : false);

const sessions = await db.collection("session").countDocuments();
console.log("sessions", sessions);
await client.close();
