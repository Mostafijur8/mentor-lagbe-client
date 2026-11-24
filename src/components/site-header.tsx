"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";

const navItems = [["Home", "/"], ["Find a tutor", "/tuitions"], ["Pricing", "/pricing"], ["How it works", "/#how-it-works"]];

// The header reflects the active route and gives signed-in users quick account actions.
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    toast("You have been signed out.", "info");
    router.push("/");
  }

  return <header className="site-header"><div className="container nav-wrap">
    <Link href="/" className="brand" aria-label="MentorLagbe home"><span className="brand-mark">m</span><span>mentor<span className="brand-accent">lagbe</span><small>LEARN WITH DIRECTION</small></span></Link>
    <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? "×" : "☰"}</button>
    <nav className={open ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">{navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? "nav-active" : ""}>{label}</Link>)}</nav>
    <div className="nav-actions">{user ? <><Link href="/dashboard" className="nav-dashboard">Dashboard</Link><Link href="/dashboard/profile" className="user-menu"><span className="avatar">{user.image ? <Image src={user.image} alt="" width={29} height={29} unoptimized/> : user.name.slice(0, 2).toUpperCase()}</span><span className="user-nav-copy"><span className="user-nav-name">{user.name}</span><small className="user-role-badge">{user.role}</small></span></Link><button className="nav-signout" onClick={handleSignOut}>Sign out</button></> : <><Link href="/sign-in" className="nav-signin">Sign in</Link><Link href="/sign-up" className="button button-small">Get started <span>↗</span></Link></>}</div>
  </div></header>;
}
