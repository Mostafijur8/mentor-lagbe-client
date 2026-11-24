"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { DashboardPageHeading } from "@/components/dashboard";

// Members can maintain their public profile and upload a photo or paste an image URL.
export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [imageUrl, setImageUrl] = useState(user?.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.image ?? "");
  const [saving, setSaving] = useState(false);

  async function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_500_000) { toast("Choose an image under 1.5 MB.", "error"); return; }
    setImageFile(file);
    const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") setPreview(reader.result); }; reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user) return;
    setSaving(true);
    try {
      let image = imageUrl.trim();
      const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (imageFile && key) {
        const form = new FormData(); form.append("image", imageFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: form });
        if (!response.ok) throw new Error("Photo upload failed. Please try again.");
        const result = await response.json() as { data?: { url?: string } };
        if (!result.data?.url) throw new Error("The image service did not return a URL.");
        image = result.data.url;
      } else if (imageFile) image = preview;
      updateProfile({ name: name.trim(), phone: phone.trim(), bio: bio.trim(), image });
      setImageUrl(image); toast("Your profile has been updated.");
    } catch (error) { toast(error instanceof Error ? error.message : "Could not update your profile.", "error"); }
    finally { setSaving(false); }
  }

  return <><DashboardPageHeading eyebrow="YOUR PROFILE, YOUR STORY" title="My profile" description="Help students or tutors know a little more about you." />
    <form className="profile-layout" onSubmit={submit}><section className="dashboard-panel profile-editor"><div className="form-section-heading"><span>01</span><div><h2>Profile details</h2><p>A few words can help the right people find you.</p></div></div><div className="form-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" value={name} onChange={(event)=>setName(event.target.value)} required minLength={2}/></div><div className="form-field"><label>Email address</label><input value={user?.email ?? ""} readOnly disabled/></div><div className="form-field"><label htmlFor="profile-phone">Phone number</label><input id="profile-phone" type="tel" value={phone} onChange={(event)=>setPhone(event.target.value)} placeholder="01XXXXXXXXX" minLength={8}/></div><div className="form-field"><label htmlFor="profile-bio">About me</label><textarea id="profile-bio" value={bio} onChange={(event)=>setBio(event.target.value)} maxLength={500} placeholder="What are you learning or teaching? What should people know about you?"/><small className="character-count">{bio.length}/500</small></div><button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"} <span>↗</span></button></section>
      <aside className="dashboard-panel profile-photo-panel"><span className="eyebrow">PROFILE PHOTO</span><div className="profile-photo">{preview ? <Image src={preview} alt="Profile preview" width={112} height={112} unoptimized/> : <span>{name.slice(0,2).toUpperCase() || "ML"}</span>}</div><p>A friendly photo helps build trust in the community.</p><label className="button button-outline photo-upload">Upload a photo<input type="file" accept="image/*" onChange={chooseImage}/></label><div className="profile-divider"><span>or add an image link</span></div><div className="form-field"><label htmlFor="profile-image-url">Image URL</label><input id="profile-image-url" type="url" value={imageUrl} onChange={(event)=>{setImageUrl(event.target.value);if(!imageFile)setPreview(event.target.value)}} placeholder="https://…"/></div><div className="profile-account"><span className="account-role">{user?.role}</span><span className="account-plan">{user?.plan} plan</span></div></aside>
    </form></>;
}
