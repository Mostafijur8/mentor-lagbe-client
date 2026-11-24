import { TuitionBrowser } from "@/components/tuition-browser";

// This page presents approved active tutor listings with a responsive search and filter experience.
export default async function TuitionsPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject = "" } = await searchParams;
  return <main className="public-page"><section className="page-hero"><div className="container"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>Find the mentor<br /><em>who gets you.</em></h1><p>Browse small groups and one-on-one sessions led by people who love what they teach.</p></div></section><TuitionBrowser initialSubject={subject} /></main>;
}
