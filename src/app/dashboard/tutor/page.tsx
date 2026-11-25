"use client";

import Link from "next/link";
import { DashboardCards, DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { useApiData } from "@/hooks/use-api-data";
import type { Tuition, TuitionApplication } from "@/types";

// Tutor overview combines the account's own listings and applications returned by the API.
export default function TutorDashboardPage() {
  const { user } = useAuth();
  const { data: myTuitions, loading: tuitionsLoading, error: tuitionsError } = useApiData<Tuition[]>(user ? "/tutor/tuitions" : null, []);
  const { data: applicants, loading: applicantsLoading, error: applicantsError } = useApiData<TuitionApplication[]>(user ? "/tutor/applications" : null, []);
  const active = myTuitions.filter((item) => item.isActive && item.approvalStatus === "approved").length;
  return <><DashboardPageHeading eyebrow="YOUR MENTOR SPACE" title={`Welcome, ${user?.name.split(" ")[0] ?? "mentor"}.`} description="Your teaching, your community, and the next learner are right here." action={<Link href="/dashboard/tutor/post-tuition" className="button">+ Post a tuition</Link>} />
    <DashboardCards items={[["Tuitions posted", String(myTuitions.length).padStart(2,"0"), user?.plan === "pro" ? "Unlimited with Pro" : "2 listing free limit"],["Approved & active", String(active).padStart(2,"0"), "Visible to students"],["Applicants received", String(applicants.length).padStart(2,"0"), "Learners are interested"],["Current plan", user?.plan === "pro" ? "Pro" : "Free", user?.plan === "pro" ? "Keep growing" : "Explore unlimited posts"]]} />
    {tuitionsError && <p className="form-error" role="alert">{tuitionsError}</p>}
    {applicantsError && <p className="form-error" role="alert">{applicantsError}</p>}
    {applicantsLoading && <p className="muted-note">Loading applicant summary…</p>}
    <div className="workspace-grid"><section className="dashboard-panel"><div className="panel-heading"><div><h2>Your tuition listings</h2><p className="panel-subtitle">A quick look at your teaching offers.</p></div><Link href="/dashboard/tutor/my-tuitions" className="text-link">Manage ↗</Link></div>{myTuitions.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Applications</th><th>Review status</th></tr></thead><tbody>{myTuitions.slice(0,4).map((item) => <tr key={item._id}><td><strong>{item.title}</strong><small className="table-subtext">{item.subject} · ৳{item.monthlyFee.toLocaleString()}</small></td><td>{applicants.filter((app) => app.tuitionId === item._id).length}</td><td><StatusBadge status={item.approvalStatus}/></td></tr>)}</tbody></table></div> : !tuitionsLoading && <div className="dashboard-empty"><span>✦</span><h3>Your first listing starts here</h3><p>Tell learners what you teach and how you can help.</p><Link href="/dashboard/tutor/post-tuition" className="button button-small">Create a listing</Link></div>}</section>
      <aside className="mentor-side-card"><span className="eyebrow">A NOTE FOR YOUR NEXT STEP</span><h2>Great teaching starts with a great introduction.</h2><p>Add a few details to your profile to help learners understand how you can support them.</p><Link href="/dashboard/profile" className="text-link">Complete your profile ↗</Link></aside></div>
  </>;
}
