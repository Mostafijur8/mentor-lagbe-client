"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeading, EmptyState, StatusBadge } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { useApiData } from "@/hooks/use-api-data";
import { api, getErrorMessage } from "@/lib/api";
import type { TuitionApplication } from "@/types";

// Tutors review only applications belonging to their account and persist decisions on the API.
export default function TutorApplicantsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState("All applicants");
  const { data: applicants, loading, error, reload } = useApiData<TuitionApplication[]>(user ? "/tutor/applications" : null, []);
  const visible = useMemo(() => filter === "All applicants" ? applicants : applicants.filter((item) => item.status === filter.toLowerCase()), [filter, applicants]);

  async function setStatus(application: TuitionApplication, status: "accepted" | "rejected") {
    try {
      await api(`/applications/${encodeURIComponent(application._id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      reload();
      toast(status === "accepted" ? `${application.studentName} is on your list.` : `Application from ${application.studentName} declined.`, status === "accepted" ? "success" : "info");
    } catch (cause) {
      toast(getErrorMessage(cause), "error");
    }
  }

  return <><DashboardPageHeading eyebrow="YOUR LEARNER COMMUNITY" title="Applicants" description="Get to know the learners who would like to work with you." action={<label className="filter-select-label"><span>Show</span><select aria-label="Filter applicants" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All applicants</option><option>Pending</option><option>Accepted</option><option>Rejected</option></select></label>} />
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading && <p className="muted-note">Loading applicants…</p>}
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{visible.length} {visible.length === 1 ? "applicant" : "applicants"}</h2><p className="panel-subtitle">A thoughtful reply can make someone’s day.</p></div></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>Learner</th><th>Tuition</th><th>Preferred schedule</th><th>Note</th><th>Status</th><th>Decision</th></tr></thead><tbody>{visible.map((item) => <tr key={item._id}><td><strong>{item.studentName}</strong><small className="table-subtext">{item.studentEmail} · {item.studentPhone}</small></td><td>{item.tuitionTitle}<small className="table-subtext">৳{item.monthlyFee.toLocaleString()} / month</small></td><td>{item.preferredSchedule}</td><td><span className="applicant-note" title={item.studentNote}>{item.studentNote}</span></td><td><StatusBadge status={item.status}/></td><td>{item.status === "pending" ? <div className="row-actions"><button className="table-action" onClick={() => setStatus(item,"accepted")}>Accept</button><button className="table-action danger" onClick={() => setStatus(item,"rejected")}>Decline</button></div> : <span className="muted-small">Decision saved</span>}</td></tr>)}</tbody></table></div> : !loading && <EmptyState title="Your next learner is out there" description="When a student applies to one of your approved tuitions, their details will appear here." />}</div>
  </>;
}
