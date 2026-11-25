"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, getErrorMessage } from "@/lib/api";

// The return page confirms Stripe's session with the backend before showing success.
export function PaymentStatus({ success, plan = "pro" }: { success: boolean; plan?: string }) {
  const { user, refreshUser } = useAuth();
  const [state, setState] = useState<"checking" | "confirmed" | "failed">(success ? "checking" : "confirmed");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!success) return;
    let active = true;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      Promise.resolve().then(() => {
        if (!active) return;
        setMessage("The payment session could not be found. Please contact support if you were charged.");
        setState("failed");
      });
      return;
    }
    api("/payments/verify", { method: "POST", body: JSON.stringify({ sessionId }) })
      .then(() => refreshUser())
      .then(() => { if (active) setState("confirmed"); })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(getErrorMessage(error));
        setState("failed");
      });
    return () => { active = false; };
  }, [success, refreshUser]);

  const confirmed = success && state === "confirmed";
  const role = user?.role ?? (plan.includes("tutor") ? "tutor" : "student");
  const title = confirmed ? "A little more room to grow." : success ? "We’re confirming your payment." : "You can come back anytime.";
  const description = confirmed
    ? `Your Pro ${role} plan is active.`
    : success
      ? state === "failed" ? message : "Please wait while we verify your Stripe transaction."
      : "Your plan wasn’t changed. You can review the plans and try again when it feels right.";
  return <main className="payment-page"><div className="payment-card"><div className={`payment-symbol ${confirmed ? "paid" : "cancelled"}`}>{confirmed ? "✓" : "↗"}</div><span className="eyebrow">{confirmed ? "YOU’RE ALL SET" : success ? "PAYMENT STATUS" : "NO WORRIES"}</span><h1>{title}</h1><p>{description}</p><div className="payment-actions">{confirmed ? <Link href={`/dashboard/${role}`} className="button">Go to my dashboard <span>↗</span></Link> : <Link href="/pricing" className="button">{success ? "Return to pricing" : "View plans again"} <span>↗</span></Link>}<Link href="/" className="quiet-link">Back to home</Link></div><small>MentorLagbe · Learn with direction</small></div></main>;
}
