"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import { ApplicationForm } from "@/components/forms/application-form";
import { TuitionReviews } from "@/components/tuition-reviews";
import { getAllTuitionsSnapshot, subscribeTuitions } from "@/lib/tuition-store";
import type { Tuition } from "@/types";

// This client detail view can display both seed listings and newly created local listings.
export function TuitionDetail() {
  const { id } = useParams<{ id: string }>();
  const tuitionsJson = useSyncExternalStore(subscribeTuitions, getAllTuitionsSnapshot, () => "__loading__");
  const tuitions = useMemo(() => tuitionsJson === "__loading__" ? [] : JSON.parse(tuitionsJson) as Tuition[], [tuitionsJson]);
  const tuition = tuitions.find((item) => item._id === id && item.approvalStatus === "approved" && item.isActive) ?? null;
  if (tuitionsJson === "__loading__") return <main className="detail-page container"><div className="detail-skeleton"/></main>;
  if (!tuition) return <main className="container detail-missing"><span>⌕</span><h1>This tuition isn’t available</h1><p>It may have closed or still be waiting for review.</p><Link href="/tuitions" className="button">Browse other tuitions</Link></main>;
  const initials = tuition.tutorName.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <main className="container detail-page"><Link href="/tuitions" className="back-link">← Browse tuitions</Link>
    <div className="detail-banner">{tuition.bannerImage && <div className="detail-banner-photo" style={{ backgroundImage: `url("${tuition.bannerImage}")` }}/>}<div className="detail-banner-orb"/><div className="detail-banner-copy"><span className="subject-chip">{tuition.subject}</span><span className="mode-chip">{tuition.mode} learning</span><h1>{tuition.title}</h1><p>{tuition.classLevel} · {tuition.daysPerWeek} days each week</p></div><div className="detail-banner-symbol">{tuition.subject === "Mathematics" ? "∑" : tuition.subject === "Physics" ? "◉" : tuition.subject === "Programming" ? "⌘" : "✦"}</div></div>
    <div className="detail-grid"><article className="detail-main"><div className="detail-facts"><span>◉ {tuition.mode}</span><span>⌖ {tuition.location}</span><span>▦ {tuition.classLevel}</span><span>◷ {tuition.daysPerWeek} days / week</span></div><section className="dashboard-panel"><span className="eyebrow">A LITTLE MORE ABOUT THE PLAN</span><h2>Learning with room to grow</h2><p>{tuition.description}</p><p>Sessions are designed around your goals, with clear feedback and a supportive pace. You and your tutor can agree on a schedule that works for both of you.</p></section><section className="dashboard-panel tutor-profile"><span className="avatar avatar-large">{initials}</span><div><span className="eyebrow">YOUR POTENTIAL MENTOR</span><h2>{tuition.tutorName}</h2><p>Verified mentor · {tuition.subject} specialist</p></div></section><TuitionReviews tuitionId={tuition._id}/><section className="detail-note"><span>✦</span><p>Every listing is reviewed by the MentorLagbe team before it appears here.</p></section></article><aside><div className="detail-fee"><span className="eyebrow">MONTHLY LEARNING PLAN</span><strong>৳{tuition.monthlyFee.toLocaleString()}</strong><small>per month · {tuition.daysPerWeek} sessions weekly</small></div><ApplicationForm tuition={tuition}/></aside></div>
  </main>;
}
