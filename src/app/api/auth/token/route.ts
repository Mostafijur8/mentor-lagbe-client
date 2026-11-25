import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { auth, authDatabase } from "@/lib/better-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bridges a verified Better Auth session to the Express API's JWT.
// The users collection stays authoritative for role, plan, and bookmarks.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const sessionUser = session?.user;
  if (!sessionUser?.email) {
    return NextResponse.json({ message: "You are not signed in." }, { status: 401 });
  }

  const email = sessionUser.email.toLowerCase().trim();
  const users = authDatabase.collection("users");
  let user = await users.findOne({ email });

  if (!user) {
    const now = new Date();
    const document = {
      name: sessionUser.name || email.split("@")[0],
      email,
      password: await bcrypt.hash(randomUUID(), 12),
      role: sessionUser.role === "tutor" ? "tutor" : "student",
      phone: typeof sessionUser.phone === "string" ? sessionUser.phone : "",
      bio: typeof sessionUser.bio === "string" ? sessionUser.bio : "",
      image: sessionUser.image || "",
      plan: "free",
      savedTuitions: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await users.insertOne(document);
      user = { ...document, _id: result.insertedId };
    } catch (error) {
      // A parallel request may have created the same account; reuse it.
      user = await users.findOne({ email });
      if (!user) throw error;
    }
  }

  // Mirror API-owned values back so Better Auth never drifts from the source of truth.
  await authDatabase.collection("user").updateOne(
    { email },
    {
      $set: {
        role: user.role,
        plan: user.plan || "free",
        updatedAt: new Date().toISOString(),
      },
    },
  );

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "JWT_SECRET is not configured." }, { status: 500 });
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"] },
  );

  const { password: _password, ...safeUser } = user;
  return NextResponse.json({ token, user: { ...safeUser, _id: user._id.toString() } });
}
