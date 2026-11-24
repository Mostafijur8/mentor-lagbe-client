"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { BookmarkButton, bookmarksKey } from "@/components/bookmark-button";
import { DashboardPageHeading, EmptyState } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { demoTuitions } from "@/lib/mock-data";
import { getClientStoreSnapshot, subscribeClientStore } from "@/lib/client-store";
import { getAllTuitionsSnapshot, subscribeTuitions } from "@/lib/tuition-store";
import type { Tuition } from "@/types";

// This page shows the student’s saved listings and their current Free or Pro limit.
export default function SavedTuitionsPage() {
  const { user } = useAuth();
  const idsJson = useSyncExternalStore((callback) => subscribeClientStore(bookmarksKey, callback), () => getClientStoreSnapshot(bookmarksKey, [] as string[]), () => JSON.stringify([]));
  const tuitionsJson = useSyncExternalStore(subscribeTuitions, getAllTuitionsSnapshot, () => JSON.stringify(demoTuitions));
  const ids = useMemo(() => JSON.parse(idsJson) as string[], [idsJson]);
  const tuitions = useMemo(() => JSON.parse(tuitionsJson) as Tuition[], [tuitionsJson]);
  const saved = tuitions.filter((tuition) => ids.includes(tuition._id));
  return <><DashboardPageHeading eyebrow="YOUR SHORTLIST" title="Saved tuitions" description="Keep the mentors you’re considering close by." action={<span className="saved-count">{user?.plan === "pro" ? `${saved.length} saved · Unlimited` : `${saved.length} / 5 saved`}</span>} />
    {saved.length ? <div className="tuition-grid">{saved.map((tuition) => <article className="saved-tuition" key={tuition._id}><div className="saved-remove"><BookmarkButton tuitionId={tuition._id}/></div><div className="card-topline"><span className="subject-chip">{tuition.subject}</span><span className="mode-chip">{tuition.mode}</span></div><h3>{tuition.title}</h3><p>{tuition.classLevel} · {tuition.daysPerWeek} days/week</p><div className="saved-card-footer"><span>৳{tuition.monthlyFee.toLocaleString()} / month</span><Link href={`/tuitions/${tuition._id}`}>View details ↗</Link></div></article>)}</div> : <div className="dashboard-panel"><EmptyState title="Your shortlist is ready when you are" description="Save a tuition that feels like a good fit, then come back here to compare your options." action={<Link href="/tuitions" className="button button-small">Explore tuitions</Link>} /></div>}
    {user?.plan === "free" && saved.length >= 4 && <div className="student-tip"><span>✦</span><div><strong>Want more room to explore?</strong><p>Pro members can save as many tuitions as they like.</p></div><Link href="/pricing">Explore Pro ↗</Link></div>}
  </>;
}
