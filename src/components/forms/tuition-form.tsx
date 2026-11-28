'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { DashboardPageHeading } from '@/components/dashboard';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/ui/toast-provider';
import { api, getErrorMessage } from '@/lib/api';
import type { Tuition, TuitionMode } from '@/types';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'IELTS',
  'Programming',
  'Bangla',
  'Other',
];
const levels = [
  'Class 1–5',
  'Class 6–8',
  'Class 9–10',
  'HSC',
  'Admission',
  'Beginner',
  'Adult learner',
];

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Could not read this image.'));
    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.readAsDataURL(file);
  });
}

// The form uploads images through the authenticated API and submits new listings for review.
export function TuitionForm() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  async function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Choose a JPG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > 1_500_000) {
      toast('Choose an image smaller than 1.5 MB for the browser preview.', 'error');
      return;
    }
    try {
      setBanner(file);
      setPreview(await readFile(file));
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not read this image.', 'error');
    }
  }

  async function uploadBanner() {
    if (!banner) return '';
    const body = new FormData();
    body.append('image', banner);
    const result = await api<{ url: string }>('/upload/image', { method: 'POST', body });
    return result.url;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!banner) {
      toast('Add a banner image to continue.', 'error');
      return;
    }
    const form = new FormData(event.currentTarget);
    setUploading(true);
    try {
      const bannerImage = await uploadBanner();
      const tuition = {
        title: String(form.get('title')).trim(),
        subject: String(form.get('subject')),
        classLevel: String(form.get('classLevel')),
        mode: String(form.get('mode')) as TuitionMode,
        location: String(form.get('location')).trim(),
        monthlyFee: Number(form.get('monthlyFee')),
        daysPerWeek: Number(form.get('daysPerWeek')),
        bannerImage,
        description: String(form.get('description')).trim(),
      };
      await api<Tuition>('/tuitions', { method: 'POST', body: JSON.stringify(tuition) });
      toast('Tuition submitted for review. You can find it in My tuitions.');
      router.push('/dashboard/tutor/my-tuitions');
    } catch (error) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <DashboardPageHeading
        eyebrow="SHARE WHAT YOU KNOW"
        title="Post a tuition"
        description="Help a learner find the right next step with you."
      />
      <form className="dashboard-form tuition-form" onSubmit={submit}>
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>The learning plan</h2>
            <p>A few details help learners know if it’s a good fit.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label htmlFor="tuition-title">Tuition title</label>
            <input
              id="tuition-title"
              name="title"
              
              required
              placeholder="e.g. Build strong foundations in algebra"
            />
          </div>
          <div className="form-field">
            <label htmlFor="tuition-subject">Subject</label>
            <select id="tuition-subject" name="subject" required defaultValue="">
              <option value="" disabled>
                Choose a subject
              </option>
              {subjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="tuition-level">Class or learner level</label>
            <select id="tuition-level" name="classLevel" required defaultValue="">
              <option value="" disabled>
                Choose a level
              </option>
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="tuition-mode">Learning mode</label>
            <select id="tuition-mode" name="mode" required>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="tuition-location">Location</label>
            <input
              id="tuition-location"
              name="location"
              required
              placeholder="Online or your area in Dhaka"
            />
          </div>
          <div className="form-field">
            <label htmlFor="tuition-fee">Monthly fee (৳)</label>
            <input
              id="tuition-fee"
              name="monthlyFee"
              type="number"
              min="500"
              max="200000"
              step="100"
              required
              placeholder="5000"
            />
          </div>
          <div className="form-field">
            <label htmlFor="tuition-days">Days per week</label>
            <select id="tuition-days" name="daysPerWeek" required defaultValue="">
              <option value="" disabled>
                Choose days
              </option>
              {[1, 2, 3, 4, 5, 6].map((day) => (
                <option key={day} value={day}>
                  {day} {day === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field span-2">
            <label htmlFor="tuition-description">What will learners get from your sessions?</label>
            <textarea
              id="tuition-description"
              name="description"
              required
              placeholder="Share your approach, what you’ll cover, and how you’ll help learners make progress…"
            />
          </div>
        </div>
        <div className="form-section-heading form-section-spaced">
          <span>02</span>
          <div>
            <h2>Make it yours</h2>
            <p>Add an image that helps your tuition stand out.</p>
          </div>
        </div>
        <label
          className={`image-dropzone ${preview ? 'has-preview' : ''}`}
          htmlFor="tuition-banner"
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Tuition banner preview"
                width={680}
                height={260}
                unoptimized
              />
              <span className="image-change">Change banner</span>
            </>
          ) : (
            <>
              <span className="upload-icon">↑</span>
              <strong>Choose a banner image</strong>
              <small>JPG, PNG or WebP · under 1.5 MB</small>
            </>
          )}
          <input
            id="tuition-banner"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={chooseImage}
          />
        </label>
        <div className="form-actions">
          <span>New listings are reviewed before appearing publicly.</span>
          <button className="button" type="submit" disabled={uploading}>
            {uploading ? 'Saving your tuition…' : 'Submit for review'} <span>↗</span>
          </button>
        </div>
      </form>
    </>
  );
}
