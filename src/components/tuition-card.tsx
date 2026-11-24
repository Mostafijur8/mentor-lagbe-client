import Link from 'next/link';
import { BookmarkButton } from '@/components/bookmark-button';
import type { Tuition } from '@/types';

// A consistent card helps students compare learning format, tutor, and monthly fee quickly.
export function TuitionCard({ tuition }: { tuition: Tuition }) {
  const initials = tuition.tutorName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return (
    <article className="tuition-card">
      <div className="card-topline">
        <span className="subject-chip">{tuition.subject}</span>
        <span className="mode-chip">
          <span aria-hidden="true">{tuition.mode === 'Online' ? '◉' : '⌖'}</span>
          {tuition.mode}
        </span>
        <BookmarkButton tuitionId={tuition._id} />
      </div>
      <h3>{tuition.title}</h3>
      <p className="card-level">
        {tuition.classLevel} <span>·</span> {tuition.daysPerWeek} days / week
      </p>
      <div className="tutor-row">
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <span>
          <strong>{tuition.tutorName}</strong>
          <small>Verified mentor</small>
        </span>
        <span className="fee">
          ৳{tuition.monthlyFee.toLocaleString()}
          <small>/ month</small>
        </span>
      </div>
      <div className="card-bottom">
        <span aria-label={`Location: ${tuition.location}`}>⌖ {tuition.location}</span>
        <Link href={`/tuitions/${tuition._id}`}>
          View details <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
