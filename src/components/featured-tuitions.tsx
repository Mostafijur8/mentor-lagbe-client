"use client";

import { useApiData } from "@/hooks/use-api-data";
import { TuitionCard } from "@/components/tuition-card";
import type { Tuition } from "@/types";

export function FeaturedTuitions() {
  const { data: featured, loading, error } = useApiData<Tuition[]>("/tuitions?featured=true&limit=6", []);

  if (loading) return <p className="muted-note">Loading featured tuitions…</p>;
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!featured.length) {
    return <p className="empty-results">New mentor listings are on their way. Check back soon.</p>;
  }

  return <div className="tuition-grid">
    {featured.map((tuition) => <TuitionCard key={tuition._id} tuition={tuition} />)}
  </div>;
}
