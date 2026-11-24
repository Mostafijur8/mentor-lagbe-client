import { AuthForm } from "@/components/forms/auth-form";

// This route creates a student or tutor account and starts the free plan.
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <AuthForm mode="sign-up" defaultRole={role === "tutor" ? "tutor" : "student"} />;
}
