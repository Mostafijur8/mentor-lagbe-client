"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { useToast } from "@/components/ui/toast-provider";

const navItems = [["Home", "/"], ["Find a tutor", "/tuitions"], ["Pricing", "/pricing"], ["How it works", "/#how-it-works"]];

// The header reflects the active route and gives signed-in users quick account actions.
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
    toast("You have been signed out.", "info");
    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" aria-label="MentorLagbe home">
          <span className="brand-mark">m</span>
          <span>mentor<span className="brand-accent">lagbe</span><small>LEARN WITH DIRECTION</small></span>
        </Link>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
        <nav className={open ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={pathname === href ? "nav-active" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <div className="account-menu" ref={menuRef}>
              <button
                type="button"
                className="account-trigger"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Open account menu for ${user.name}`}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className="account-avatar-wrap">
                  <UserAvatar name={user.name} image={user.image} size={36} />
                  <span className="account-presence" aria-hidden="true" />
                </span>
                <span className="account-trigger-copy">
                  <span className="account-trigger-name">{user.name}</span>
                  <span className="account-trigger-role">{user.role}</span>
                </span>
                <ChevronDown className="account-chevron" size={14} aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="account-dropdown" role="menu" aria-label="Account menu">
                  <div className="account-dropdown-head">
                    <UserAvatar name={user.name} image={user.image} size={44} />
                    <span className="account-dropdown-identity">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </span>
                  </div>
                  <div className="account-dropdown-links">
                    <Link href="/dashboard" role="menuitem" onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard size={16} aria-hidden="true" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                      <UserRound size={16} aria-hidden="true" />
                      <span>Edit profile</span>
                      <span className="account-plan-pill">{user.plan}</span>
                    </Link>
                  </div>
                  <button type="button" className="account-dropdown-signout" role="menuitem" onClick={handleSignOut}>
                    <LogOut size={16} aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="nav-signin">Sign in</Link>
              <Link href="/sign-up" className="button button-small">Get started <span>↗</span></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
