'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/ui/toast-provider';
import { getErrorMessage } from '@/lib/api';
import type { Role, UserProfile } from '@/types';

type AuthFormProps = { mode: 'sign-in' | 'sign-up'; defaultRole?: 'student' | 'tutor' };

// One auth form sends account credentials to the server and routes by its verified role.
export function AuthForm({ mode, defaultRole = 'student' }: AuthFormProps) {
  const isSignUp = mode === 'sign-up';
  const { signIn, signUp, authError } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignUp && password.length < 8) {
      toast('Use at least 8 characters for your password.', 'error');
      return;
    }
    if (isSignUp && password !== confirm) {
      toast('Your passwords do not match.', 'error');
      return;
    }
    setBusy(true);
    try {
      let profile: UserProfile;
      if (isSignUp) {
        const newProfile: UserProfile = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role as 'student' | 'tutor',
          plan: 'free',
        };
        profile = await signUp(newProfile, password);
        toast('Your account is ready. Welcome to MentorLagbe!');
      } else {
        profile = await signIn(email.trim().toLowerCase(), password);
        toast('Welcome back. Your workspace is ready!');
      }
      router.push(`/dashboard/${profile.role}`);
    } catch (error) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  function useDemoAccount() {
    setEmail('rahim.tutor@example.com');
    setPassword('Password123!');
  }

  return (
    <main className="auth-page">
      <aside className="auth-art">
        <Link href="/" className="brand">
          <span className="brand-mark">m</span>
          <span>
            mentor<span className="brand-accent">lagbe</span>
            <small>LEARN WITH DIRECTION</small>
          </span>
        </Link>
        <div>
          <div className="eyebrow">A LITTLE HELP GOES A LONG WAY</div>
          <h1>
            {isSignUp ? (
              <>
                Make room for
                <br />
                <em>what’s next.</em>
              </>
            ) : (
              <>
                Good to see
                <br />
                <em>you again.</em>
              </>
            )}
          </h1>
          <p>
            {isSignUp
              ? 'Meet kind, capable mentors who’ll help you take your next step with confidence.'
              : 'Pick up where you left off. Your next breakthrough is closer than you think.'}
          </p>
          {authError && <p className="form-error" role="alert">{authError}</p>}
        </div>
        <span className="auth-art-note">“You don’t have to figure it all out alone.”</span>
        <div className="auth-art-decoration">
          <span>✳</span>
          <span>∑</span>
          <span>✦</span>
        </div>
      </aside>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <span className="eyebrow">{isSignUp ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span>
          <h2>{isSignUp ? 'Create your account' : 'Sign in to MentorLagbe'}</h2>
          <p>
            {isSignUp
              ? 'A few details, then you’re on your way.'
              : 'Enter your details to access your learning space.'}
          </p>
          <form onSubmit={submit}>
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="form-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <div className="password-field">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={isSignUp ? 8 : 1}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {isSignUp && (
              <div className="form-field">
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter password again"
                />
              </div>
            )}
            {isSignUp && <div className="form-field">
              <label htmlFor="auth-role">I’m here as a</label>
              <select id="auth-role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>}
            {!isSignUp && (
              <div className="form-field">
                <label>Seeded backend demo</label>
                <button type="button" className="demo-fill" onClick={useDemoAccount}>
                  Fill tutor demo credentials
                </button>
              </div>
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy ? 'One moment…' : isSignUp ? 'Create account' : 'Sign in'}
              <span>↗</span>
            </button>
          </form>
          <div className="form-foot">
            {isSignUp ? (
              <>
                Already part of MentorLagbe? <Link href="/sign-in">Sign in</Link>
              </>
            ) : (
              <>
                New here? <Link href="/sign-up">Create an account</Link>
              </>
            )}
          </div>
          <div className="form-note">
            Your account is verified and stored by the MentorLagbe server.
          </div>
        </div>
      </section>
    </main>
  );
}
