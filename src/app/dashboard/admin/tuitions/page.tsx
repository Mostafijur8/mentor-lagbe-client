"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeading, EmptyState, StatusBadge } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast-provider";
import { useApiData } from "@/hooks/use-api-data";
import { api, getErrorMessage } from "@/lib/api";
import type { Tuition } from "@/types";

// Moderation decisions are checked by the admin API and persisted in MongoDB.
export default function AdminTuitionsPage() {
  const toast = useToast();
  const { data: items, loading, error, reload } = useApiData<Tuition[]>("/admin/tuitions", []);
  const [filter, setFilter] = useState("Needs review");
  const visible = useMemo(() => filter === "All listings" ? items : filter === "Needs review" ? items.filter((item) => item.approvalStatus === "pending") : items.filter((item) => item.approvalStatus === filter.toLowerCase()), [filter, items]);

  async function decide(tuition: Tuition, approvalStatus: "approved" | "rejected") {
    try {
      await api(`/admin/tuitions/${encodeURIComponent(tuition._id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus }),
      });
      reload();
      toast(approvalStatus === "approved" ? "Tuition approved and ready for students." : "Tuition returned to the tutor.", approvalStatus === "approved" ? "success" : "info");
    } catch (cause) {
      toast(getErrorMessage(cause), "error");
    }
  }

  return <><DashboardPageHeading eyebrow="KEEPING THE COMMUNITY TRUSTWORTHY" title="Tuition review" description="Take a moment to make sure each listing is ready for learners." action={<label className="filter-select-label"><span>Show</span><select aria-label="Filter tuition review status" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Needs review</option><option>All listings</option><option>Approved</option><option>Rejected</option></select></label>} />
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading && <p className="muted-note">Loading tuition reviews…</p>}
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{visible.length} {visible.length === 1 ? "listing" : "listings"}</h2><p className="panel-subtitle">Only approved and active tuition is shown publicly.</p></div></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>Tuition details</th><th>Tutor</th><th>Format & budget</th><th>Submitted</th><th>Review status</th><th>Decision</th></tr></thead><tbody>{visible.map((item)=><tr key={item._id}><td><strong>{item.title}</strong><small className="table-subtext">{item.subject} · {item.classLevel}</small></td><td>{item.tutorName}<small className="table-subtext">{item.tutorEmail}</small></td><td>{item.mode} · ৳{item.monthlyFee.toLocaleString()}<small className="table-subtext">{item.daysPerWeek} days/week · {item.location}</small></td><td>{new Date(item.createdAt).toLocaleDateString("en-BD")}</td><td><StatusBadge status={item.approvalStatus}/></td><td>{item.approvalStatus === "pending" ? <div className="row-actions"><button className="table-action" onClick={() => decide(item,"approved")}>Approve</button><button className="table-action danger" onClick={() => decide(item,"rejected")}>Reject</button></div> : <span className="muted-small">Reviewed</span>}</td></tr>)}</tbody></table></div> : !loading && <EmptyState title="Nothing in this review queue" description="New tutor submissions will show up here when they’re ready." />}</div>
  </>;
}
