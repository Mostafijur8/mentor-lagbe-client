"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { DashboardPageHeading, EmptyState, StatusBadge } from "@/components/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { demoTuitions } from "@/lib/mock-data";
import { deleteTuition, getAllTuitionsSnapshot, subscribeTuitions, updateTuition } from "@/lib/tuition-store";
import type { Tuition } from "@/types";

// Tutors can search listings, revise details, close active offers, and remove their posts.
export default function MyTuitionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const allJson = useSyncExternalStore(subscribeTuitions, getAllTuitionsSnapshot, () => JSON.stringify(demoTuitions));
  const all = useMemo(() => JSON.parse(allJson) as Tuition[], [allJson]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Tuition | null>(null);
  const [deleting, setDeleting] = useState<Tuition | null>(null);
  const mine = all.filter((item) => item.tutorEmail === user?.email);
  const filtered = useMemo(() => mine.filter((item) => `${item.title} ${item.subject}`.toLowerCase().includes(query.toLowerCase())), [mine, query]);

  function toggleActive(tuition: Tuition) {
    const isActive = !tuition.isActive; updateTuition(tuition._id, { isActive });
    toast(isActive ? "Your tuition is open again." : "Your tuition is now closed.", "info");
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const form = new FormData(event.currentTarget);
    updateTuition(editing._id, { title: String(form.get("title")).trim(), location: String(form.get("location")).trim(), monthlyFee: Number(form.get("monthlyFee")), description: String(form.get("description")).trim(), approvalStatus: "pending" });
    setEditing(null); toast("Changes saved. This listing is back in review.");
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteTuition(deleting._id); setDeleting(null); toast("Tuition listing removed.", "info");
  }

  return <><DashboardPageHeading eyebrow="YOUR TEACHING OFFERS" title="My tuitions" description="Manage the learning plans you’ve shared with the community." action={<Link href="/dashboard/tutor/post-tuition" className="button">+ New tuition</Link>} />
    <div className="dashboard-panel"><div className="panel-heading"><div><h2>{mine.length} {mine.length === 1 ? "listing" : "listings"}</h2><p className="panel-subtitle">Edits are reviewed again to keep the community trustworthy.</p></div><label className="table-search"><span>⌕</span><input aria-label="Search my tuitions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listings"/></label></div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Tuition</th><th>Monthly fee</th><th>Review status</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{filtered.map((item) => <tr key={item._id}><td><strong>{item.title}</strong><small className="table-subtext">{item.subject} · {item.classLevel}</small></td><td>৳{item.monthlyFee.toLocaleString()}</td><td><StatusBadge status={item.approvalStatus}/></td><td><StatusBadge status={item.isActive ? "Active" : "Closed"}/></td><td><div className="row-actions"><button className="table-action" onClick={() => setEditing(item)}>Edit</button><button className="table-action" onClick={() => toggleActive(item)}>{item.isActive ? "Close" : "Open"}</button><button className="table-action danger" onClick={() => setDeleting(item)}>Delete</button></div></td></tr>)}</tbody></table></div> : <EmptyState title={query ? "No listings match this search" : "Your first tuition is waiting"} description={query ? "Try searching with a different title or subject." : "Create a thoughtful listing and help a learner take the next step."} action={!query && <Link href="/dashboard/tutor/post-tuition" className="button button-small">Post a tuition</Link>} />}
    </div>
    {editing && <div className="modal-backdrop"><section className="confirm-dialog edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="panel-heading"><div><span className="eyebrow">UPDATE YOUR LISTING</span><h2 id="edit-title">Edit tuition</h2></div><button className="icon-close" onClick={() => setEditing(null)} aria-label="Close">×</button></div><form onSubmit={saveEdit}><div className="form-field"><label htmlFor="edit-title-field">Title</label><input id="edit-title-field" name="title" defaultValue={editing.title} required minLength={8}/></div><div className="form-field"><label htmlFor="edit-location">Location</label><input id="edit-location" name="location" defaultValue={editing.location} required/></div><div className="form-field"><label htmlFor="edit-fee">Monthly fee (৳)</label><input id="edit-fee" name="monthlyFee" type="number" min="500" defaultValue={editing.monthlyFee} required/></div><div className="form-field"><label htmlFor="edit-description">Description</label><textarea id="edit-description" name="description" defaultValue={editing.description} required minLength={30}/></div><p className="review-note">Saving changes sends this listing for admin review again.</p><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button className="button">Save changes</button></div></form></section></div>}
    {deleting && <div className="modal-backdrop"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="confirm-icon">!</span><h2 id="delete-title">Delete this tuition?</h2><p>This removes “{deleting.title}” from your teaching offers.</p><div><button className="button button-outline" onClick={() => setDeleting(null)}>Keep listing</button><button className="button button-danger" onClick={confirmDelete}>Delete tuition</button></div></section></div>}
  </>;
}
