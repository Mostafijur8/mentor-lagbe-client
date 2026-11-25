'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/ui/toast-provider';
import { ApiError, api, getErrorMessage } from '@/lib/api';
import type { Tuition } from '@/types';

// Applications are validated, deduplicated, and persisted by the student API.
export function ApplicationForm({ tuition }: { tuition: Tuition }) {
  const { user, ready, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [schedule, setSchedule] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== 'student') return;
    setBusy(true);
    try {
      await api('/applications', {
        method: 'POST',
        body: JSON.stringify({
          tuitionId: tuition._id,
          studentPhone: phone,
          preferredSchedule: schedule,
          studentNote: note,
        }),
      });
      setSent(true);
      toast('Application sent. The tutor will be in touch soon.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSent(true);
        toast('You have already applied to this tuition.', 'info');
      } else {
        toast(getErrorMessage(error), 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  if (!ready)
    return (
      <div className="apply-card">
        <p>Checking your account…</p>
      </div>
    );
  if (!user)
    return (
      <div className="apply-card">
        <div className="eyebrow">READY TO TAKE THE FIRST STEP?</div>
        <h2>Let’s get learning.</h2>
        <p>Sign in with your student account to send a request to this mentor.</p>
        <Link href="/sign-in?next=/tuitions" className="button button-full">
          Sign in to apply <span>↗</span>
        </Link>
        <small className="muted-note">Only student accounts can apply for tuition.</small>
      </div>
    );
  if (user.role !== 'student')
    return (
      <div className="apply-card">
        <div className="eyebrow">STUDENT APPLICATION</div>
        <h2>For learners</h2>
        <p>
          You’re signed in as a {user.role}. Sign out and create or access a student account to
          apply.
        </p>
        <button
          className="button button-full"
          onClick={() => {
            signOut();
            toast('Signed out. You can now sign in as a student.', 'info');
            router.push('/sign-in');
          }}
        >
          Switch account <span>↗</span>
        </button>
      </div>
    );
  if (sent)
    return (
      <div className="apply-card">
        <span className="success-icon">✓</span>
        <h2>Application received</h2>
        <p>
          Your request is with {tuition.tutorName}. You can check its status from your dashboard.
        </p>
        <Link href="/dashboard/student/my-applications" className="button button-full">
          View my applications <span>↗</span>
        </Link>
      </div>
    );

  return (
    <div className="apply-card">
      <div className="eyebrow">A GOOD PLACE TO BEGIN</div>
      <h2>Apply for tuition</h2>
      <p>Tell {tuition.tutorName.split(' ')[0]} a little about your learning goals.</p>
      <form onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="apply-phone">Phone number</label>
          <input
            id="apply-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            minLength={8}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
          />
        </div>
        <div className="form-field">
          <label htmlFor="apply-schedule">Preferred schedule</label>
          <input
            id="apply-schedule"
            value={schedule}
            onChange={(event) => setSchedule(event.target.value)}
            required
            placeholder="Evenings, Sunday–Tuesday"
          />
        </div>
        <div className="form-field">
          <label htmlFor="apply-note">What would you like help with?</label>
          <textarea
            id="apply-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={400}
            placeholder="Share a little about your goals…"
          />
        </div>
        <button className="button button-full" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send application'} <span>↗</span>
        </button>
      </form>
      <small className="muted-note">
        No charge to apply. You can track replies in your dashboard.
      </small>
    </div>
  );
}
