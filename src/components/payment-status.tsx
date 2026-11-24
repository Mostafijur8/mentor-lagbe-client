import Link from "next/link";

// Shared payment states keep success and cancellation routes calm and easy to understand.
export function PaymentStatus({ success, plan = "pro" }: { success: boolean; plan?: string }) {
  const role = plan.includes("tutor") ? "Tutor" : "Student";
  return <main className="payment-page"><div className="payment-card"><div className={success ? "payment-symbol paid" : "payment-symbol cancelled"}>{success ? "✓" : "↗"}</div><span className="eyebrow">{success ? "YOU’RE ALL SET" : "NO WORRIES"}</span><h1>{success ? "A little more room to grow." : "You can come back anytime."}</h1><p>{success ? `Your Pro ${role} preview is active in this browser. In the backend phase, this step will confirm the Stripe transaction.` : "Your plan wasn’t changed. You can review the plans and try again when it feels right."}</p><div className="payment-actions">{success ? <Link href={`/dashboard/${role.toLowerCase()}`} className="button">Go to my dashboard <span>↗</span></Link> : <Link href="/pricing" className="button">View plans again <span>↗</span></Link>}<Link href="/" className="quiet-link">Back to home</Link></div><small>MentorLagbe · Learn with direction</small></div></main>;
}
