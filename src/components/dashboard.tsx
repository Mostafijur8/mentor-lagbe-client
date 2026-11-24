"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import type { Role } from "@/types";

const dashboardNav: Record<Role, [string, string, string][]> = {
  student: [["Overview", "/dashboard/student", "⌂"], ["My applications", "/dashboard/student/my-applications", "▤"], ["Saved tuitions", "/dashboard/student/saved-tuitions", "♡"]],
  tutor: [["Overview", "/dashboard/tutor", "⌂"], ["Post a tuition", "/dashboard/tutor/post-tuition", "+"], ["My tuitions", "/dashboard/tutor/my-tuitions", "▤"], ["Applicants", "/dashboard/tutor/applicants", "♙"]],
  admin: [["Overview", "/dashboard/admin", "⌂"], ["Users", "/dashboard/admin/users", "♙"], ["Tuition review", "/dashboard/admin/tuitions", "▤"], ["Transactions", "/dashboard/admin/transactions", "$"]],
};

// This shell keeps dashboard navigation consistent and protects private demo routes.
export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, ready, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/sign-in");
    else if (pathname === "/dashboard") router.replace(`/dashboard/${user.role}`);
    else if (pathname.startsWith("/dashboard/student") && user.role !== "student") router.replace(`/dashboard/${user.role}`);
    else if (pathname.startsWith("/dashboard/tutor") && user.role !== "tutor") router.replace(`/dashboard/${user.role}`);
    else if (pathname.startsWith("/dashboard/admin") && user.role !== "admin") router.replace(`/dashboard/${user.role}`);
  }, [ready, user, pathname, router]);

  if (!ready || !user || (pathname === "/dashboard")) return <main className="dashboard-loading"><span className="loading-orbit"/><p>Opening your learning space…</p></main>;
  const nav = dashboardNav[user.role];
  const activeTitle = nav.find(([, href]) => href === pathname)?.[0] ?? (pathname === "/dashboard/profile" ? "My profile" : "Workspace");

  function logout() {
    signOut(); toast("You have been signed out.", "info"); router.push("/");
  }

  return <div className={`dashboard-layout ${collapsed ? "dashboard-collapsed" : ""}`}><aside className="dashboard-sidebar"><Link href="/" className="brand"><span className="brand-mark">m</span><span>mentor<span className="brand-accent">lagbe</span><small>LEARNING SPACE</small></span></Link><span className="sidebar-label">WORKSPACE</span>{nav.map(([label, href, icon]) => <Link key={href} href={href} className={`side-link ${pathname === href ? "active" : ""}`}><span className="side-icon">{icon}</span><span>{label}</span></Link>)}<span className="sidebar-label">ACCOUNT</span><Link className={`side-link ${pathname === "/dashboard/profile" ? "active" : ""}`} href="/dashboard/profile"><span className="side-icon">♙</span><span>My profile</span></Link><Link className="side-link" href="/pricing"><span className="side-icon">✦</span><span>{user.plan === "pro" ? "Manage Pro" : "Explore Pro"}</span></Link><div className="sidebar-user"><span className="avatar">{user.name.slice(0,2).toUpperCase()}</span><span className="sidebar-user-meta"><strong>{user.name}</strong><small>{user.role} · {user.plan}</small></span><button className="logout-icon" aria-label="Sign out" onClick={logout}>↗</button></div></aside>
    <main className="dashboard-main"><header className="dash-top"><div className="dash-breadcrumb"><button className="sidebar-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? "☰" : "⇤"}</button><span>Learning space <span>/</span> {activeTitle}</span></div><Link href="/dashboard/profile" className="dash-profile"><span className="avatar">{user.name.slice(0,2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.role}</small></span></Link></header><div className="dash-content">{children}</div></main>
    <nav className="mobile-dash-nav" aria-label="Dashboard navigation">{nav.slice(0,4).map(([label,href,icon])=><Link key={href} href={href} className={pathname === href ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>)}<Link href="/dashboard/profile" className={pathname === "/dashboard/profile" ? "active" : ""}><span>♙</span><small>Profile</small></Link></nav>
  </div>;
}

export function DashboardPageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="dashboard-page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="dashboard-heading-action">{action}</div>}</div>;
}

export function DashboardCards({ items }: { items: [string, string, string][] }) {
  return <div className="stats-grid">{items.map(([label, value, hint]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>)}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${tone}`}>{status}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="dashboard-empty"><span>✦</span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
