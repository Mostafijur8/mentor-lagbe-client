import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";
import "./theme.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "MentorLagbe | Find your learning mentor",
  description: "Find verified tutors and personalized learning support with MentorLagbe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></body></html>;
}
