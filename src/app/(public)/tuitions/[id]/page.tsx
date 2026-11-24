import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/forms/application-form";
import { demoTuitions } from "@/lib/mock-data";

// The detail page gives students the full listing context before they submit an application.
export default async function TuitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tuition = demoTuitions.find((item) => item._id === id && item.approvalStatus === "approved" && item.isActive);
  if (!tuition) notFound();
  const initials = tuition.tutorName.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <main className="container detail-page"><Link href="/tuitions" className="back-link">← Browse tuitions</Link>
    <div className="detail-banner"><div className="detail-banner-orb"/><div className="detail-banner-copy"><span className="subject-chip">{tuition.subject}</span><span className="mode-chip">{tuition.mode} learning</span><h1>{tuition.title}</h1><p>{tuition.classLevel} · {tuition.daysPerWeek} days each week</p></div><div className="detail-banner-symbol">{tuition.subject === "Mathematics" ? "∑" : tuition.subject === "Physics" ? "◉" : tuition.subject === "Programming" ? "⌘" : "✦"}</div></div>
    <div className="detail-grid"><article className="detail-main"><div className="detail-facts"><span>◉ {tuition.mode}</span><span>⌖ {tuition.location}</span><span>▦ {tuition.classLevel}</span><span>◷ {tuition.daysPerWeek} days / week</span></div><section className="dashboard-panel"><span className="eyebrow">A LITTLE MORE ABOUT THE PLAN</span><h2>Learning with room to grow</h2><p>{tuition.description}</p><p>Sessions are designed around your goals, with clear feedback and a supportive pace. You and your tutor can agree on a schedule that works for both of you.</p></section><section className="dashboard-panel tutor-profile"><span className="avatar avatar-large">{initials}</span><div><span className="eyebrow">YOUR POTENTIAL MENTOR</span><h2>{tuition.tutorName}</h2><p>Verified mentor · {tuition.subject} specialist</p><div className="tutor-rating">★★★★★ <span>4.9 · 28 learner reviews</span></div></div></section><section className="detail-note"><span>✦</span><p>Every listing is reviewed by the MentorLagbe team before it appears here.</p></section></article><aside><div className="detail-fee"><span className="eyebrow">MONTHLY LEARNING PLAN</span><strong>৳{tuition.monthlyFee.toLocaleString()}</strong><small>per month · {tuition.daysPerWeek} sessions weekly</small></div><ApplicationForm tuition={tuition}/></aside></div>
  </main>;
}
