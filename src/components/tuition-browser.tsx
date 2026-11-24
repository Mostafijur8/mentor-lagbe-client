"use client";

import { useMemo, useState } from "react";
import { TuitionCard } from "@/components/tuition-card";
import { demoTuitions } from "@/lib/mock-data";

const pageSize = 6;

// Search and filter the approved demo listings in the browser until server search is available.
export function TuitionBrowser({ initialSubject = "" }: { initialSubject?: string }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(initialSubject || "All subjects");
  const [classLevel, setClassLevel] = useState("Any level");
  const [mode, setMode] = useState("Any mode");
  const [page, setPage] = useState(1);
  const subjects = [...new Set(demoTuitions.map((item) => item.subject))].sort();
  const levels = [...new Set(demoTuitions.map((item) => item.classLevel))].sort();
  const results = useMemo(() => demoTuitions.filter((item) => {
    const matchesQuery = `${item.title} ${item.subject}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesSubject = subject === "All subjects" || item.subject === subject;
    const matchesClass = classLevel === "Any level" || item.classLevel === classLevel;
    const matchesMode = mode === "Any mode" || item.mode === mode;
    return item.approvalStatus === "approved" && item.isActive && matchesQuery && matchesSubject && matchesClass && matchesMode;
  }), [query, subject, classLevel, mode]);
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const visible = results.slice((page - 1) * pageSize, page * pageSize);

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery(""); setSubject("All subjects"); setClassLevel("Any level"); setMode("Any mode"); setPage(1);
  }

  return <section className="container browse-wrap">
    <div className="filter-bar"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search tutor or subject" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Try “HSC Physics” or “IELTS”" /></label>
      <label className="sr-only" htmlFor="subject-filter">Subject</label><select id="subject-filter" value={subject} onChange={(event) => changeFilter(setSubject, event.target.value)}><option>All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select>
      <label className="sr-only" htmlFor="class-filter">Class level</label><select id="class-filter" value={classLevel} onChange={(event) => changeFilter(setClassLevel, event.target.value)}><option>Any level</option>{levels.map((item) => <option key={item}>{item}</option>)}</select>
      <label className="sr-only" htmlFor="mode-filter">Learning mode</label><select id="mode-filter" value={mode} onChange={(event) => changeFilter(setMode, event.target.value)}><option>Any mode</option><option>Online</option><option>Offline</option></select>
    </div>
    <div className="results-heading"><h2>Thoughtful matches <span>({results.length})</span></h2><span>Reviewed mentors · Updated regularly</span></div>
    {visible.length ? <div className="tuition-grid">{visible.map((item) => <TuitionCard key={item._id} tuition={item} />)}</div> : <div className="empty-results"><span>⌕</span><h2>No matches just yet</h2><p>Try a broader search or clear a filter to see more tutors.</p><button className="button button-outline" onClick={clearFilters}>Clear filters</button></div>}
    {results.length > pageSize && <nav className="pagination" aria-label="Tuition pages"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>← Previous</button><span>Page <strong>{page}</strong> of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next →</button></nav>}
  </section>;
}
