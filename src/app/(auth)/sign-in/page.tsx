import { AuthForm } from "@/components/forms/auth-form";

// This route renders the returning-user sign-in and demo workspace selector.
export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
