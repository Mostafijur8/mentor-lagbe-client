"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";

// The plan selector adapts the Pro offer and preview checkout to student or tutor accounts.
export function PricingPlans() {
  const { user, updateProfile } = useAuth();
  const [role, setRole] = useState<"student" | "tutor">(user?.role === "tutor" ? "tutor" : "student");
  const router = useRouter();
  const toast = useToast();
  const price = role === "tutor" ? 15 : 10;
  const features = role === "tutor"
    ? ["Unlimited tuition listings", "Pro profile badge", "Reach more motivated learners", "Priority applicant notifications"]
    : ["Unlimited saved tuitions", "Priority booking access", "Stand out to great tutors", "Personal learning tracker"];

  function subscribe() {
    if (!user) { router.push(`/sign-in?next=/pricing&role=${role}`); return; }
    if (user.role !== role) { toast(`Sign in with a ${role} account to choose this plan.`, "info"); return; }
    updateProfile({ plan: "pro" });
    toast("Pro preview activated. Connect Stripe to enable real payments.");
    router.push(`/payment/success?plan=pro-${role}`);
  }

  return <><div className="role-switch" role="group" aria-label="Choose account type"><button className={role === "student" ? "selected" : ""} onClick={() => setRole("student")}>I’m a student</button><button className={role === "tutor" ? "selected" : ""} onClick={() => setRole("tutor")}>I’m a tutor</button></div><section className="container plans-grid"><article className="plan-card"><span className="eyebrow">STARTER</span><h2>Free</h2><p>For your first steps on MentorLagbe.</p><ul><li>✓ &nbsp;Browse every approved tuition</li><li>✓ &nbsp;{role === "student" ? "Apply to 5 tuitions" : "Post up to 2 tuitions"}</li><li>✓ &nbsp;A profile that feels like you</li><li>✓ &nbsp;Access to the learning community</li></ul><Link href={`/sign-up?role=${role}`} className="button button-outline">Get started free <span>↗</span></Link></article><article className="plan-card plan-featured"><span className="eyebrow">A LITTLE MORE ROOM TO GROW</span><h2>Pro <small>· {role}</small></h2><p>For {role === "student" ? "learners ready to go further" : "mentors ready to grow"}.</p><div className="plan-price"><strong>${price}</strong><span>USD / month</span></div><ul>{features.map((feature) => <li key={feature}>✓ &nbsp;{feature}</li>)}</ul><button className="button button-light" onClick={subscribe} disabled={user?.role === role && user.plan === "pro"}>{user?.role === role && user.plan === "pro" ? "You’re on Pro" : "Choose Pro"} <span>↗</span></button><small className="plan-footnote">Frontend preview only · Stripe checkout is connected in the backend phase.</small></article></section></>;
}
