"use client";

import { useMemo, useSyncExternalStore } from "react";
import { TuitionCard } from "@/components/tuition-card";
import { demoTuitions } from "@/lib/mock-data";
import { getAllTuitionsSnapshot, subscribeTuitions } from "@/lib/tuition-store";
import type { Tuition } from "@/types";

export function FeaturedTuitions() {
  const tuitionsJson = useSyncExternalStore(
    subscribeTuitions,
    getAllTuitionsSnapshot,
    () => JSON.stringify(demoTuitions),
  );
  const tuitions = useMemo(() => JSON.parse(tuitionsJson) as Tuition[], [tuitionsJson]);
  const featured = useMemo(
    () => tuitions
      .filter((tuition) => tuition.approvalStatus === "approved" && tuition.isActive)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    [tuitions],
  );

  if (!featured.length) {
    return <p className="empty-results">New mentor listings are on their way. Check back soon.</p>;
  }

  return <div className="tuition-grid">
    {featured.map((tuition) => <TuitionCard key={tuition._id} tuition={tuition} />)}
  </div>;
}
