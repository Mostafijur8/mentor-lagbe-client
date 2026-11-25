"use client";

import Link from "next/link";
import { DashboardCards, DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { useApiData } from "@/hooks/use-api-data";
import type { PaymentRecord, Tuition } from "@/types";

type AdminStats = {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
};

// Admin overview uses protected dashboard metrics and live moderation/payment records.
export default function AdminDashboardPage() {
  const { data: stats, error: statsError } = useApiData<AdminStats>("/dashboard/stats", {
    totalUsers: 0, totalTutors: 0, pendingTuitions: 0, approvedTuitions: 0, totalRevenue: 0,
  });
  const { data: tuitions, error: tuitionsError } = useApiData<Tuition[]>("/admin/tuitions", []);
  const { data: payments, error: paymentsError } = useApiData<PaymentRecord[]>("/admin/payments", []);
  const pending = tuitions.filter((item) => item.approvalStatus === "pending");

  return <><DashboardPageHeading eyebrow="PLATFORM OVERVIEW" title="A good day to make things better." description="Keep the MentorLagbe community welcoming, safe, and moving forward." />
    {(statsError || tuitionsError || paymentsError) && <p className="form-error" role="alert">{statsError || tuitionsError || paymentsError}</p>}
    <DashboardCards items={[["Community members", String(stats.totalUsers), "Registered accounts"],["Tutor community", String(stats.totalTutors), "Registered tutors"],["Needs review", String(stats.pendingTuitions).padStart(2,"0"), "Tuition listings in your queue"],["Subscription revenue", `$${stats.totalRevenue}`, "Verified transactions"]]} />
    <div className="workspace-grid"><section className="dashboard-panel"><div className="panel-heading"><div><h2>Needs your attention</h2><p className="panel-subtitle">Review new listings before they reach learners.</p></div><Link href="/dashboard/admin/tuitions" className="text-link">Review all ↗</Link></div>{pending.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Tutor</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{pending.slice(0,4).map((item)=><tr key={item._id}><td><strong>{item.title}</strong><small className="table-subtext">{item.subject} · {item.classLevel}</small></td><td>{item.tutorName}</td><td>{new Date(item.createdAt).toLocaleDateString("en-BD")}</td><td><StatusBadge status="Needs review"/></td></tr>)}</tbody></table></div>:<div className="dashboard-empty"><span>✓</span><h3>All caught up</h3><p>New tuition submissions will appear here.</p></div>}</section>
      <aside className="mentor-side-card"><span className="eyebrow">COMMUNITY PULSE</span><h2>A thoughtful review builds trust.</h2><p>Every approved listing helps students find a clearer path to their goals.</p><Link href="/dashboard/admin/users" className="text-link">Manage the community ↗</Link></aside></div>
    <section className="dashboard-panel admin-recent"><div className="panel-heading"><h2>Latest payments</h2><Link href="/dashboard/admin/transactions" className="text-link">All transactions ↗</Link></div><div className="table-wrap"><table><thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.slice(0,5).map((payment)=><tr key={payment._id}><td>{payment.userName}<small className="table-subtext">{payment.userEmail}</small></td><td>{payment.planName}</td><td>${payment.amount} {payment.currency}</td><td><StatusBadge status={payment.paymentStatus}/></td></tr>)}</tbody></table></div></section>
  </>;
}
