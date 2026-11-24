"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast-provider";
import { demoUsers } from "@/lib/mock-data";
import { readClientStore, writeClientStore } from "@/lib/client-store";
import type { Role, UserProfile } from "@/types";

const key = "mentorlagbe-demo-users";

// Admins can search member records and change a demo member role for interface review.
export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserProfile[]>(() => readClientStore(key, demoUsers));
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const visible = useMemo(() => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()) && (roleFilter === "All roles" || user.role === roleFilter.toLowerCase())), [users, query, roleFilter]);

  function changeRole(email: string, role: Role) {
    const updated = users.map((user) => user.email === email ? { ...user, role } : user);
    setUsers(updated); writeClientStore(key, updated); toast("Member role updated.");
  }

  return <><DashboardPageHeading eyebrow="A COMMUNITY THAT LEARNS TOGETHER" title="Members" description="Find a member and keep their account details up to date." action={<label className="filter-select-label"><span>Role</span><select value={roleFilter} aria-label="Filter members by role" onChange={(event)=>setRoleFilter(event.target.value)}><option>All roles</option><option>Student</option><option>Tutor</option><option>Admin</option></select></label>} />
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{visible.length} members</h2><p className="panel-subtitle">Demo directory · role changes stay in this browser.</p></div><label className="table-search"><span>⌕</span><input aria-label="Search members" placeholder="Name or email" value={query} onChange={(event)=>setQuery(event.target.value)}/></label></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>Member</th><th>Account role</th><th>Plan</th><th>Joined</th><th>Change role</th></tr></thead><tbody>{visible.map((user,index)=><tr key={user.email}><td><strong>{user.name}</strong><small className="table-subtext">{user.email}</small></td><td><StatusBadge status={user.role}/></td><td>{user.plan === "pro" ? <StatusBadge status="Pro"/> : "Free"}</td><td>{["Nov 20, 2026","Nov 19, 2026","Nov 18, 2026"][index%3]}</td><td><select className="role-select" value={user.role} aria-label={`Change role for ${user.name}`} onChange={(event)=>changeRole(user.email,event.target.value as Role)}><option value="student">Student</option><option value="tutor">Tutor</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div> : <div className="dashboard-empty"><h3>No members found</h3><p>Try a different name, email, or role.</p></div>}</div>
  </>;
}
