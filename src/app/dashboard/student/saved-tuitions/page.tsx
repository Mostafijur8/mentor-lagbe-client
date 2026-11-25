"use client";

import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { DashboardPageHeading, EmptyState } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { useApiData } from "@/hooks/use-api-data";
import type { Tuition } from "@/types";

// The saved list is loaded from the signed-in student's backend account.
export default function SavedTuitionsPage() {
  const { user } = useAuth();
  const { data: savedFromApi, loading, error } = useApiData<Tuition[]>(user?.role === "student" ? "/student/bookmarks" : null, []);
  const saved = savedFromApi.filter((tuition) => (user?.savedTuitions ?? []).includes(tuition._id));
  return <><DashboardPageHeading eyebrow="YOUR SHORTLIST" title="Saved tuitions" description="Keep the mentors you’re considering close by." action={<span className="saved-count">{user?.plan === "pro" ? `${saved.length} saved · Unlimited` : `${saved.length} / 5 saved`}</span>} />
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading && <p className="muted-note">Loading saved tuitions…</p>}
    {saved.length ? <div className="tuition-grid">{saved.map((tuition) => <article className="saved-tuition" key={tuition._id}><div className="saved-remove"><BookmarkButton tuitionId={tuition._id}/></div><div className="card-topline"><span className="subject-chip">{tuition.subject}</span><span className="mode-chip">{tuition.mode}</span></div><h3>{tuition.title}</h3><p>{tuition.classLevel} · {tuition.daysPerWeek} days/week</p><div className="saved-card-footer"><span>৳{tuition.monthlyFee.toLocaleString()} / month</span><Link href={`/tuitions/${tuition._id}`}>View details ↗</Link></div></article>)}</div> : <div className="dashboard-panel"><EmptyState title="Your shortlist is ready when you are" description="Save a tuition that feels like a good fit, then come back here to compare your options." action={<Link href="/tuitions" className="button button-small">Explore tuitions</Link>} /></div>}
    {user?.plan === "free" && saved.length >= 4 && <div className="student-tip"><span>✦</span><div><strong>Want more room to explore?</strong><p>Pro members can save as many tuitions as they like.</p></div><Link href="/pricing">Explore Pro ↗</Link></div>}
  </>;
}
