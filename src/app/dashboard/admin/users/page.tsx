"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast-provider";
import { useApiData } from "@/hooks/use-api-data";
import { api, getErrorMessage } from "@/lib/api";
import type { Role, UserProfile } from "@/types";

// Admin member records and role changes are loaded and validated by protected server routes.
export default function AdminUsersPage() {
  const toast = useToast();
  const { data: users, loading, error, reload } = useApiData<UserProfile[]>("/admin/users", []);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const visible = useMemo(() => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()) && (roleFilter === "All roles" || user.role === roleFilter.toLowerCase())), [users, query, roleFilter]);

  async function changeRole(user: UserProfile, role: Role) {
    if (!user._id) return;
    try {
      await api(`/admin/users/${encodeURIComponent(user._id)}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      reload();
      toast("Member role updated.");
    } catch (cause) {
      toast(getErrorMessage(cause), "error");
    }
  }

  return <><DashboardPageHeading eyebrow="A COMMUNITY THAT LEARNS TOGETHER" title="Members" description="Find a member and keep their account details up to date." action={<label className="filter-select-label"><span>Role</span><select value={roleFilter} aria-label="Filter members by role" onChange={(event)=>setRoleFilter(event.target.value)}><option>All roles</option><option>Student</option><option>Tutor</option><option>Admin</option></select></label>} />
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading && <p className="muted-note">Loading members…</p>}
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{visible.length} members</h2><p className="panel-subtitle">Registered MentorLagbe accounts.</p></div><label className="table-search"><span>⌕</span><input aria-label="Search members" placeholder="Name or email" value={query} onChange={(event)=>setQuery(event.target.value)}/></label></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>Member</th><th>Account role</th><th>Plan</th><th>Joined</th><th>Change role</th></tr></thead><tbody>{visible.map((user)=><tr key={user.email}><td><strong>{user.name}</strong><small className="table-subtext">{user.email}</small></td><td><StatusBadge status={user.role}/></td><td>{user.plan === "pro" ? <StatusBadge status="Pro"/> : "Free"}</td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-BD") : "—"}</td><td><select className="role-select" value={user.role} aria-label={`Change role for ${user.name}`} onChange={(event)=>changeRole(user,event.target.value as Role)}><option value="student">Student</option><option value="tutor">Tutor</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div> : !loading && <div className="dashboard-empty"><h3>No members found</h3><p>Try a different name, email, or role.</p></div>}</div>
  </>;
}
