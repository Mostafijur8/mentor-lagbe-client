import Link from "next/link";

export default function NotFound() {
  return <main className="page-placeholder"><p>We couldn’t find that page. <Link href="/">Go back home</Link>.</p></main>;
}
