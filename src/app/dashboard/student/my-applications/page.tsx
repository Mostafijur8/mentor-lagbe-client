"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardPageHeading, EmptyState, StatusBadge } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { demoApplications, demoTuitions } from "@/lib/mock-data";
import { readClientStore, writeClientStore } from "@/lib/client-store";

const key = "mentorlagbe-demo-applications";

// Students can review every application and withdraw requests that are still pending.
export default function MyApplicationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All statuses");
  const [canceling, setCanceling] = useState<string | null>(null);
  const [allItems, setItems] = useState(() => readClientStore(key, demoApplications));
  const items = allItems.filter((item) => item.studentEmail === user?.email);
  const visible = useMemo(() => filter === "All statuses" ? items : items.filter((item) => item.status === filter.toLowerCase()), [filter, items]);

  function cancelApplication(id: string) {
    const updated = readClientStore(key, demoApplications).filter((item) => item._id !== id);
    writeClientStore(key, updated); setItems(updated);
    setCanceling(null); toast("Pending application cancelled.", "info");
  }

  return <><DashboardPageHeading eyebrow="YOUR LEARNING JOURNEY" title="My applications" description="Keep every tutor conversation and next step in one place." action={<label className="filter-select-label"><span>Show</span><select aria-label="Filter application status" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All statuses</option><option>Pending</option><option>Accepted</option><option>Rejected</option></select></label>} />
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{visible.length} {visible.length === 1 ? "application" : "applications"}</h2><p className="panel-subtitle">We’ll keep your status up to date.</p></div></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Mentor</th><th>Monthly fee</th><th>Applied on</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((item) => <tr key={item._id}><td><strong>{item.tuitionTitle}</strong><small className="table-subtext">{item.subject}</small></td><td>{demoTuitions.find((tuition) => tuition.tutorEmail === item.tutorEmail)?.tutorName ?? "Mentor"}<small className="table-subtext">{item.tutorEmail}</small></td><td>৳{item.monthlyFee.toLocaleString()}</td><td>{new Date(item.appliedAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</td><td><StatusBadge status={item.status}/></td><td>{item.status === "pending" ? <button className="table-action danger" onClick={() => setCanceling(item._id)}>Cancel</button> : <Link className="table-action" href={`/tuitions/${item.tuitionId}`}>View tuition</Link>}</td></tr>)}</tbody></table></div> : <EmptyState title="No applications in this view" description="Explore the tutor community and reach out when someone feels like a good fit." action={<Link href="/tuitions" className="button button-small">Browse tuitions</Link>} />}</div>
    {canceling && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCanceling(null); }}><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-title"><span className="confirm-icon">↗</span><h2 id="cancel-title">Cancel this application?</h2><p>The tutor won’t receive any further updates for this request.</p><div><button className="button button-outline" onClick={() => setCanceling(null)}>Keep application</button><button className="button button-danger" onClick={() => cancelApplication(canceling)}>Cancel application</button></div></section></div>}
  </>;
}
