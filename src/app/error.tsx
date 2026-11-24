"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="recovery-page"><span className="recovery-mark">!</span><span className="eyebrow">A SMALL DETOUR</span><h1>That didn’t go as planned.</h1><p>Something went wrong while opening this page. Try again, or head back to the home page.</p><div><button className="button" onClick={() => reset()}>Try again</button><Link href="/" className="quiet-link">Back to home</Link></div></main>;
}
