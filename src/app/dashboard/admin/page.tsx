"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { DashboardCards, DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { getClientStoreSnapshot, subscribeClientStore } from "@/lib/client-store";
import { demoPayments, demoTuitions, demoUsers } from "@/lib/mock-data";
import { getAllTuitionsSnapshot, subscribeTuitions } from "@/lib/tuition-store";
import type { Tuition, UserProfile } from "@/types";

const usersKey = "mentorlagbe-demo-users";

// Admin overview reflects changes made in the browser demo workspace.
export default function AdminDashboardPage() {
  const tuitionsJson = useSyncExternalStore(subscribeTuitions, getAllTuitionsSnapshot, () => JSON.stringify(demoTuitions));
  const usersJson = useSyncExternalStore(
    (callback) => subscribeClientStore(usersKey, callback),
    () => getClientStoreSnapshot(usersKey, demoUsers),
    () => JSON.stringify(demoUsers),
  );
  const tuitions = useMemo(() => JSON.parse(tuitionsJson) as Tuition[], [tuitionsJson]);
  const users = useMemo(() => JSON.parse(usersJson) as UserProfile[], [usersJson]);
  const pending = tuitions.filter((item) => item.approvalStatus === "pending");
  const tutorCount = users.filter((user) => user.role === "tutor").length;
  const revenue = demoPayments.reduce((total, payment) => total + payment.amount, 0);

  return <><DashboardPageHeading eyebrow="PLATFORM OVERVIEW" title="A good day to make things better." description="Keep the MentorLagbe community welcoming, safe, and moving forward." />
    <DashboardCards items={[["Community members", String(users.length), "Demo member profiles"],["Tutor community", String(tutorCount), "Demo tutor profiles"],["Needs review", String(pending.length).padStart(2,"0"), "Tuition listings in your queue"],["Subscription revenue", `$${revenue}`, "From demo transactions"]]} />
    <div className="workspace-grid"><section className="dashboard-panel"><div className="panel-heading"><div><h2>Needs your attention</h2><p className="panel-subtitle">Review new listings before they reach learners.</p></div><Link href="/dashboard/admin/tuitions" className="text-link">Review all ↗</Link></div>{pending.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Tutor</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{pending.slice(0,4).map((item)=><tr key={item._id}><td><strong>{item.title}</strong><small className="table-subtext">{item.subject} · {item.classLevel}</small></td><td>{item.tutorName}</td><td>{item.createdAt}</td><td><StatusBadge status="Needs review"/></td></tr>)}</tbody></table></div>:<div className="dashboard-empty"><span>✓</span><h3>All caught up</h3><p>New tuition submissions will appear here.</p></div>}</section>
      <aside className="mentor-side-card"><span className="eyebrow">COMMUNITY PULSE</span><h2>A thoughtful review builds trust.</h2><p>Every approved listing helps students find a clearer path to their goals.</p><Link href="/dashboard/admin/users" className="text-link">Manage the community ↗</Link></aside></div>
    <section className="dashboard-panel admin-recent"><div className="panel-heading"><h2>Latest payments</h2><Link href="/dashboard/admin/transactions" className="text-link">All transactions ↗</Link></div><div className="table-wrap"><table><thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody>{demoPayments.map((payment)=><tr key={payment._id}><td>{payment.userName}<small className="table-subtext">{payment.userEmail}</small></td><td>{payment.planName}</td><td>${payment.amount} {payment.currency}</td><td><StatusBadge status={payment.paymentStatus}/></td></tr>)}</tbody></table></div></section>
  </>;
}
