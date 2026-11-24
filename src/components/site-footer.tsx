import Link from "next/link";

// The footer keeps support information, key routes, and the current X brand mark available site-wide.
export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div><Link href="/" className="brand footer-brand"><span className="brand-mark">m</span><span>mentor<span className="brand-accent">lagbe</span><small>LEARN WITH DIRECTION</small></span></Link><p>Good learning starts with the right person in your corner.</p></div>
    <div><strong>Explore</strong><Link href="/tuitions">Browse tuitions</Link><Link href="/pricing">Plans & pricing</Link><Link href="/#how-it-works">How it works</Link></div>
    <div><strong>Get in touch</strong><a href="mailto:hello@mentorlagbe.com">hello@mentorlagbe.com</a><a href="tel:+8801700000000">+880 1700-000000</a><span>Dhaka, Bangladesh</span><div className="social-links"><a href="https://facebook.com" aria-label="Facebook">f</a><a href="https://instagram.com" aria-label="Instagram">◎</a><a href="https://x.com" aria-label="X">𝕏</a></div></div>
  </div><div className="container copyright">© {new Date().getFullYear()} MentorLagbe · Made for curious minds.</div></footer>;
}
