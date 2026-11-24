"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="page-placeholder"><p>Something went wrong. <button onClick={() => reset()}>Try again</button></p></main>;
}
