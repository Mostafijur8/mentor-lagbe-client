import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer premium-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">m</span>
            <span>
              mentor<span className="brand-accent">lagbe</span>
              <small>LEARN WITH DIRECTION</small>
            </span>
          </Link>
          <p className="footer-tagline">
            A clearer path to learning starts with the right person in your corner.
          </p>
          <span className="footer-community-note">Thoughtful learning, built around you.</span>
          <div className="social-links" aria-label="Social media">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <Facebook size={16} aria-hidden="true" />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
              <Instagram size={16} aria-hidden="true" />
            </a>
            <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer">
              <span aria-hidden="true">𝕏</span>
            </a>
          </div>
        </div>
        <nav className="footer-column" aria-label="Footer navigation">
          <strong>Explore</strong>
          <Link href="/tuitions">Browse tuitions</Link>
          <Link href="/pricing">Plans & pricing</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/sign-up?role=tutor">Teach with us</Link>
        </nav>
        <div className="footer-column footer-contact">
          <strong>Get in touch</strong>
          <a href="mailto:hello@mentorlagbe.com">
            <Mail size={15} aria-hidden="true" />
            hello@mentorlagbe.com
          </a>
          <a href="tel:+8801700000000">
            <Phone size={15} aria-hidden="true" />
            +880 1700-000000
          </a>
          <span>
            <MapPin size={15} aria-hidden="true" />
            Dhaka, Bangladesh
          </span>
        </div>
        <div className="footer-cta">
          <span className="footer-cta-label">YOUR NEXT STEP</span>
          <h2>Find the support that moves you forward.</h2>
          <Link href="/tuitions" className="button button-light">
            Explore mentors <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container copyright footer-bottom">
        <span>© {new Date().getFullYear()} MentorLagbe. All rights reserved.</span>
        <span>Made for curious minds in Bangladesh and beyond.</span>
      </div>
    </footer>
  );
}
