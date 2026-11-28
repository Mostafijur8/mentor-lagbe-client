import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";
import "./theme.css";
import "./premium.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MentorLagbe | Find your learning mentor",
  description: "Find verified tutors and personalized learning support with MentorLagbe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={inter.variable}><body><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></body></html>;
}
