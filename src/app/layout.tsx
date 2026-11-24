import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorLagbe | Find your learning mentor",
  description: "Find verified tutors and personalized learning support with MentorLagbe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>;
}
