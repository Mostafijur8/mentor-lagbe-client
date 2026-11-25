"use client";

import { useEffect, useState } from "react";
import { TuitionCard } from "@/components/tuition-card";
import { useApiData } from "@/hooks/use-api-data";
import type { Tuition } from "@/types";

const pageSize = 6;

type TuitionPage = {
  tuitions: Tuition[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  facets?: { subjects: string[]; classLevels: string[]; modes: string[] };
};

const emptyPage: TuitionPage = {
  tuitions: [],
  page: 1,
  limit: pageSize,
  total: 0,
  totalPages: 0,
  facets: { subjects: [], classLevels: [], modes: ["Online", "Offline"] },
};

// Public discovery asks the API for approved listings so search, filters, and
// pagination stay correct even when the catalogue grows beyond one page.
export function TuitionBrowser({ initialSubject = "" }: { initialSubject?: string }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [classLevel, setClassLevel] = useState("");
  const [mode, setMode] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
  if (debouncedQuery) params.set("search", debouncedQuery);
  if (subject) params.set("subject", subject);
  if (classLevel) params.set("classLevel", classLevel);
  if (mode) params.set("mode", mode);

  const { data, loading, error } = useApiData<TuitionPage>(
    `/tuitions?${params.toString()}`,
    emptyPage,
  );
  const subjects = data.facets?.subjects ?? [];
  const levels = data.facets?.classLevels ?? [];
  const totalPages = Math.max(1, data.totalPages);

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setSubject("");
    setClassLevel("");
    setMode("");
    setPage(1);
  }

  return <section className="container browse-wrap">
    <div className="filter-bar"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search tutor or subject" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Try “HSC Physics” or “IELTS”" /></label>
      <label className="sr-only" htmlFor="subject-filter">Subject</label><select id="subject-filter" value={subject} onChange={(event) => changeFilter(setSubject, event.target.value)}><option value="">All subjects</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <label className="sr-only" htmlFor="class-filter">Class level</label><select id="class-filter" value={classLevel} onChange={(event) => changeFilter(setClassLevel, event.target.value)}><option value="">Any level</option>{levels.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <label className="sr-only" htmlFor="mode-filter">Learning mode</label><select id="mode-filter" value={mode} onChange={(event) => changeFilter(setMode, event.target.value)}><option value="">Any mode</option><option value="Online">Online</option><option value="Offline">Offline</option></select>
    </div>
    <div className="results-heading"><h2>Thoughtful matches <span>({data.total})</span></h2><span>Reviewed mentors · Updated regularly</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading && <p className="muted-note">Loading tutor listings…</p>}
    {data.tuitions.length ? <div className="tuition-grid">{data.tuitions.map((item) => <TuitionCard key={item._id} tuition={item} />)}</div> : !loading && <div className="empty-results"><span>⌕</span><h2>No matches just yet</h2><p>Try a broader search or clear a filter to see more tutors.</p><button className="button button-outline" onClick={clearFilters}>Clear filters</button></div>}
    {data.totalPages > 1 && <nav className="pagination" aria-label="Tuition pages"><button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>← Previous</button><span>Page <strong>{page}</strong> of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next →</button></nav>}
  </section>;
}
