"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { demoApplications } from "@/lib/mock-data";
import { readClientStore, writeClientStore } from "@/lib/client-store";
import type { Tuition, TuitionApplication } from "@/types";

const applicationsKey = "mentorlagbe-demo-applications";

// Students can apply once per tuition and keep track of each request in their workspace.
export function ApplicationForm({ tuition }: { tuition: Tuition }) {
  const { user, ready, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const applications = readClientStore(applicationsKey, demoApplications);
  const duplicate = Boolean(user && applications.some((item) => item.tuitionId === tuition._id && item.studentEmail === user.email));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== "student") return;
    const current = readClientStore(applicationsKey, demoApplications);
    if (current.some((item) => item.tuitionId === tuition._id && item.studentEmail === user.email)) {
      toast("You have already applied to this tuition.", "info");
      setSent(true);
      return;
    }
    const application: TuitionApplication = {
      _id: `app-${Date.now()}`, tuitionId: tuition._id, tuitionTitle: tuition.title,
      subject: tuition.subject, monthlyFee: tuition.monthlyFee, tutorEmail: tuition.tutorEmail,
      studentName: user.name, studentEmail: user.email, studentPhone: phone,
      preferredSchedule: schedule, studentNote: note, status: "pending", appliedAt: new Date().toISOString().slice(0, 10),
    };
    writeClientStore(applicationsKey, [application, ...current]);
    setSent(true);
    toast("Application sent. The tutor will be in touch soon.");
  }

  if (!ready) return <div className="apply-card"><p>Checking your account…</p></div>;
  if (!user) return <div className="apply-card"><div className="eyebrow">READY TO TAKE THE FIRST STEP?</div><h2>Let’s get learning.</h2><p>Sign in with your student account to send a request to this mentor.</p><Link href="/sign-in?next=/tuitions" className="button button-full">Sign in to apply <span>↗</span></Link><small className="muted-note">Only student accounts can apply for tuition.</small></div>;
  if (user.role !== "student") return <div className="apply-card"><div className="eyebrow">STUDENT APPLICATION</div><h2>For learners</h2><p>You’re signed in as a {user.role}. Sign out and create or access a student account to apply.</p><button className="button button-full" onClick={() => { signOut(); toast("Signed out. You can now sign in as a student.", "info"); router.push("/sign-in"); }}>Switch account <span>↗</span></button></div>;
  if (duplicate || sent) return <div className="apply-card"><span className="success-icon">✓</span><h2>Application received</h2><p>Your request is with {tuition.tutorName}. You can check its status from your dashboard.</p><Link href="/dashboard/student/my-applications" className="button button-full">View my applications <span>↗</span></Link></div>;

  return <div className="apply-card"><div className="eyebrow">A GOOD PLACE TO BEGIN</div><h2>Apply for tuition</h2><p>Tell {tuition.tutorName.split(" ")[0]} a little about your learning goals.</p><form onSubmit={submit}><div className="form-field"><label htmlFor="apply-phone">Phone number</label><input id="apply-phone" value={phone} onChange={(event) => setPhone(event.target.value)} required minLength={8} placeholder="01XXXXXXXXX" inputMode="tel" /></div><div className="form-field"><label htmlFor="apply-schedule">Preferred schedule</label><input id="apply-schedule" value={schedule} onChange={(event) => setSchedule(event.target.value)} required placeholder="Evenings, Sunday–Tuesday" /></div><div className="form-field"><label htmlFor="apply-note">What would you like help with?</label><textarea id="apply-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={400} placeholder="Share a little about your goals…" /></div><button className="button button-full" type="submit">Send application <span>↗</span></button></form><small className="muted-note">No charge to apply. You can track replies in your dashboard.</small></div>;
}
