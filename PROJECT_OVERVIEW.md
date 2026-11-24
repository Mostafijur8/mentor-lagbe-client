# MentorLagbe project overview

## What this project is

MentorLagbe is a responsive frontend for finding tutors and managing tuition-related activity. It supports three workspace roles:

- **Students** browse tuition listings, apply to tutors, save listings, and manage their profile.
- **Tutors** create tuition listings, review applicants, and manage their profile.
- **Admins** review tuition listings, view users, and inspect the demo transaction ledger.

This repository is the frontend phase. The current authentication, tuition, application, profile, and payment flows are browser demos; they are not backed by a production API or secure identity system.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4 through the configured Turbopack CSS loader, with shared styling in `src/app/globals.css`
- ESLint 9

The TypeScript configuration enables strict checking and maps `@/*` to `src/*`. The root layout provides the authentication and toast contexts to the application.

## Application structure

```text
src/
├── app/          Routes, route layouts, loading/error states, and global styles
├── components/   Shared page UI, dashboards, forms, and providers
├── hooks/        Hooks for session and toast access
├── lib/          API helper, browser storage, demo data, and domain helpers
└── types/        Shared user, tuition, application, payment, and role types
```

The route groups `(auth)`, `(payment)`, and `(public)` organize routes without adding those names to their URLs. The project structure document has a more detailed directory map in [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Main routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/tuitions`, `/tuitions/[id]`, `/pricing` |
| Account | `/sign-in`, `/sign-up` |
| Payment preview | `/payment/success`, `/payment/cancel` |
| Student workspace | `/dashboard/student`, `/dashboard/student/my-applications`, `/dashboard/student/saved-tuitions` |
| Tutor workspace | `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/dashboard/tutor/my-tuitions`, `/dashboard/tutor/applicants` |
| Admin workspace | `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/tuitions`, `/dashboard/admin/transactions` |
| Shared account | `/dashboard/profile` |

The dashboard shell provides role-specific navigation and redirects users away from another role's dashboard. This is a frontend preview behavior, not server-side authorization.

## How the main flows work

### Accounts and sessions

`AuthProvider` exposes sign-in, sign-up, sign-out, and profile-update functions through `useAuth`. A demo user profile is stored in browser `localStorage` under `mentorlagbe-demo-user`. Sign-in selects a demo profile when the email matches, otherwise it builds a preview profile. The sign-in screen also has a demo-account shortcut for each role.

### Tuition discovery and tutor listings

Public tuition search is implemented in `TuitionBrowser`: it filters active, approved listings by text, subject, level, and learning mode, then paginates results. `tuition-store` combines the built-in demo listings with tutor-created listings and local overrides/deletions.

New tutor listings are stored locally with `pending` approval status. They can be reviewed in the admin area; only approved active listings appear in public search. Free tutors have a demo limit of two listings.

### Applications and saved listings

Students can apply from a tuition detail page. The application form checks for an existing application from that student to the same tuition and stores new applications in local browser storage. Students can later view and manage applications in their workspace. Saved tuitions and related UI state are also part of the browser-demo experience.

### Plans and payment states

Pricing offers Free and Pro previews for students and tutors. Choosing Pro updates the local demo profile and navigates to a success state; cancelling displays a separate status page. No real payment is processed by these frontend flows.

### Profiles and images

Users can edit their local profile, including their name, phone, bio, and image. Tuition and profile forms can preview images in the browser. If `NEXT_PUBLIC_IMGBB_API_KEY` is configured, the forms attempt an ImgBB upload; otherwise the preview data URL is used locally.

## Data and integration boundaries

- Shared domain types live in `src/types/index.ts` (`UserProfile`, `Tuition`, `TuitionApplication`, and `PaymentRecord`).
- `src/lib/mock-data.ts` supplies sample users, listings, applications, and payment records.
- `src/lib/client-store.ts` provides typed `localStorage` helpers and same-tab/cross-tab change subscriptions.
- `src/lib/tuition-store.ts` applies the browser-backed tuition create/update/delete operations.
- `src/lib/api.ts` is a typed fetch helper prepared for a future API. It reads `NEXT_PUBLIC_API_URL` and can attach a browser token, but the main demo flows described above use local data instead.
- `src/lib/auth.ts` contains role-navigation helpers; UI-level role checks do not replace backend authorization.

Browser storage is device- and browser-specific, can be edited by the user, and is not suitable for secrets or authoritative account/payment data. Any production release needs a backend for authentication, authorization, validation, durable storage, application processing, and payment verification. A `NEXT_PUBLIC_` environment variable is exposed to the browser, so it must not contain a secret credential.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To preview a workspace, open `/sign-in`, choose a role, and use **Fill a demo account**.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Key files

- `src/app/layout.tsx` — root metadata and providers
- `src/app/globals.css` — shared visual system and responsive styling
- `src/components/providers/auth-provider.tsx` — browser demo session
- `src/components/dashboard.tsx` — role-aware dashboard shell and shared dashboard UI
- `src/components/tuition-browser.tsx` — search, filters, and pagination
- `src/lib/mock-data.ts` — connected demo records
- `src/lib/client-store.ts` and `src/lib/tuition-store.ts` — browser-backed state
- `src/types/index.ts` — domain types
