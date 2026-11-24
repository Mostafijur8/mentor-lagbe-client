"use client";

import Link from "next/link";
import { DashboardCards, DashboardPageHeading, StatusBadge } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { demoApplications, demoTuitions } from "@/lib/mock-data";
import { readClientStore } from "@/lib/client-store";

// The student overview summarizes current applications and points toward the next learning step.
export default function StudentDashboardPage() {
  const { user } = useAuth();
  const applications = readClientStore("mentorlagbe-demo-applications", demoApplications).filter((item) => item.studentEmail === user?.email);
  const accepted = applications.filter((item) => item.status === "accepted").length;
  const pending = applications.filter((item) => item.status === "pending").length;
  return <><DashboardPageHeading eyebrow="YOUR LEARNING SPACE" title={`Good to see you${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="A small step today can take you somewhere wonderful." action={<Link className="button" href="/tuitions">Find a mentor <span>↗</span></Link>} />
    <DashboardCards items={[["Applications sent", String(applications.length).padStart(2,"0"), "Your learning journey"],["Accepted", String(accepted).padStart(2,"0"), "Ready to get started"],["Waiting for a reply", String(pending).padStart(2,"0"), "Tutors usually reply soon"],["Current plan", user?.plan === "pro" ? "Pro" : "Free", user?.plan === "pro" ? "More room to grow" : "Explore the Pro plan"]]} />
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>Recent applications</h2><p className="panel-subtitle">Your latest tutor conversations, all in one place.</p></div><Link href="/dashboard/student/my-applications" className="text-link">See all ↗</Link></div>
      {applications.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Mentor</th><th>Monthly fee</th><th>Status</th></tr></thead><tbody>{applications.slice(0,4).map((item) => <tr key={item._id}><td><strong>{item.tuitionTitle}</strong><small className="table-subtext">{item.subject}</small></td><td>{demoTuitions.find((t) => t.tutorEmail === item.tutorEmail)?.tutorName ?? "Mentor"}</td><td>৳{item.monthlyFee.toLocaleString()}</td><td><StatusBadge status={item.status}/></td></tr>)}</tbody></table></div> : <div className="dashboard-empty"><span>✦</span><h3>Your next chapter starts here</h3><p>Browse tutors, find a good fit, and your applications will appear here.</p><Link className="button button-small" href="/tuitions">Browse tuitions</Link></div>}
    </div><div className="student-tip"><span>✦</span><div><strong>A little progress adds up.</strong><p>Keep your profile up to date so mentors can get to know your learning goals.</p></div><Link href="/dashboard/profile">Update profile ↗</Link></div></>;
}
