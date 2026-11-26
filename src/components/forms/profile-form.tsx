'use client';

import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/ui/toast-provider';
import { DashboardPageHeading } from '@/components/dashboard';
import { UserAvatar } from '@/components/user-avatar';
import { api, getErrorMessage } from '@/lib/api';

const MAX_IMAGE_BYTES = 1_500_000;

// Member profile changes and image uploads are persisted through authenticated API routes.
export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [imageUrl, setImageUrl] = useState(user?.image ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.image ?? '');
  const [saving, setSaving] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const photoDirty = Boolean(imageFile) || imageUrl.trim() !== (user?.image ?? '');

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) {
      toast('Choose an image under 1.5 MB.', 'error');
      event.target.value = '';
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function resolveImageUrl() {
    if (!imageFile) return imageUrl.trim();
    const form = new FormData();
    form.append('image', imageFile);
    const result = await api<{ url: string }>('/upload/image', { method: 'POST', body: form });
    return result.url;
  }

  function applySavedImage(image: string) {
    setImageUrl(image);
    setPreview(image);
    setImageFile(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  // Saves only the photo so members can update their picture without touching other fields.
  async function savePhoto() {
    if (!user) return;
    setSavingPhoto(true);
    try {
      const image = await resolveImageUrl();
      await updateProfile({ image });
      applySavedImage(image);
      toast(image ? 'Your profile photo has been saved.' : 'Your profile photo has been removed.');
    } catch (error) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setSavingPhoto(false);
    }
  }

  function removePhoto() {
    setImageFile(null);
    setImageUrl('');
    setPreview('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const image = await resolveImageUrl();
      await updateProfile({ name: name.trim(), phone: phone.trim(), bio: bio.trim(), image });
      applySavedImage(image);
      toast('Your profile has been updated.');
    } catch (error) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardPageHeading
        eyebrow="YOUR PROFILE, YOUR STORY"
        title="My profile"
        description="Help students or tutors know a little more about you."
      />
      <form className="profile-layout" onSubmit={submit}>
        <section className="dashboard-panel profile-editor">
          <div className="form-section-heading">
            <span>01</span>
            <div>
              <h2>Profile details</h2>
              <p>A few words can help the right people find you.</p>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="form-field">
            <label>Email address</label>
            <input value={user?.email ?? ''} readOnly disabled />
          </div>
          <div className="form-field">
            <label htmlFor="profile-phone">Phone number</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
              minLength={8}
            />
          </div>
          <div className="form-field">
            <label htmlFor="profile-bio">About me</label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              placeholder="What are you learning or teaching? What should people know about you?"
            />
            <small className="character-count">{bio.length}/500</small>
          </div>
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'} <span>↗</span>
          </button>
        </section>
        <aside className="dashboard-panel profile-photo-panel">
          <span className="eyebrow">PROFILE PHOTO</span>
          <div className="profile-photo-wrap">
            <div className="profile-photo">
              <UserAvatar name={name} image={preview} size={112} />
            </div>
            <label htmlFor="profile-photo-input" className="photo-camera" aria-label="Choose a profile photo">
              <Camera size={16} aria-hidden="true" />
            </label>
          </div>
          <input
            id="profile-photo-input"
            ref={photoInputRef}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={chooseImage}
          />
          <p>A friendly photo helps build trust in the community.</p>
          <div className="photo-actions">
            <label htmlFor="profile-photo-input" className="button button-outline photo-upload">
              <ImagePlus size={15} aria-hidden="true" />
              {imageFile ? 'Choose another photo' : 'Upload a photo'}
            </label>
            <button
              type="button"
              className="button photo-save"
              onClick={savePhoto}
              disabled={!photoDirty || saving || savingPhoto}
            >
              {savingPhoto ? 'Saving photo…' : 'Save photo'}
            </button>
          </div>
          {photoDirty && <small className="photo-dirty">Unsaved photo changes</small>}
          {preview && (
            <button type="button" className="photo-remove" onClick={removePhoto} disabled={saving || savingPhoto}>
              <Trash2 size={13} aria-hidden="true" /> Remove photo
            </button>
          )}
          <div className="profile-divider">
            <span>or add an image link</span>
          </div>
          <div className="form-field">
            <label htmlFor="profile-image-url">Image URL</label>
            <input
              id="profile-image-url"
              type="url"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImageFile(null);
                setPreview(event.target.value);
              }}
              placeholder="https://…"
            />
          </div>
          <div className="profile-account">
            <span className="account-role">{user?.role}</span>
            <span className="account-plan">{user?.plan} plan</span>
          </div>
        </aside>
      </form>
    </>
  );
}
