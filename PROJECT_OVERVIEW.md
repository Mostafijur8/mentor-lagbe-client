# MentorLagbe project overview

## What this project is

MentorLagbe is a responsive tuition discovery and management app. This repository contains the Next.js frontend; the sibling `mentor-lagbe-server` repository provides its Express/MongoDB API. It supports three workspace roles:

- **Students** browse tuition listings, apply to tutors, save listings, and manage their profile.
- **Tutors** create tuition listings, review applicants, and manage their profile.
- **Admins** review tuition listings, view users, and inspect the demo transaction ledger.

The frontend uses the backend API for authentication and domain data. Backend availability and valid environment configuration are required for sign-in and protected dashboard features.

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

The dashboard shell provides role-specific navigation, while the API enforces permissions for protected data and mutations.

## How the main flows work

### Accounts and sessions

`AuthProvider` exposes sign-in, sign-up, sign-out, and profile-update functions through `useAuth`. The backend verifies credentials and returns a JWT; the frontend stores the token in browser `localStorage` and retrieves the current account from `/api/auth/me`. Protected requests attach the JWT as a Bearer token. The seeded tutor account shortcut is available after running the backend seed command.

### Tuition discovery and tutor listings

Public tuition search is implemented in `TuitionBrowser`, which loads approved listings from the API and filters by text, subject, level, and learning mode. Tutor listings and moderation decisions are persisted by protected API routes.

New tutor listings are stored in MongoDB with `pending` approval status. Admins can review them; only approved active listings appear in public search. The backend enforces the free tutor limit.

### Applications and saved listings

Students can apply from a tuition detail page. The API prevents duplicate applications and persists student/tutor application actions and bookmarks.

### Plans and payment states

Pricing offers Free and Pro plans. Choosing Pro starts Stripe Checkout through the API; the success page verifies the returned session with the backend before showing activation. The current backend checkout is a one-time payment.

### Profiles and images

Users can edit their server profile, including their name, phone, bio, and image. Profile and tuition images upload through the authenticated backend so the ImgBB API key remains server-side.

## Data and integration boundaries

- Shared domain types live in `src/types/index.ts` (`UserProfile`, `Tuition`, `TuitionApplication`, and `PaymentRecord`).
- `src/lib/api.ts` is the typed fetch helper for `NEXT_PUBLIC_API_URL`; it attaches the server-issued JWT.
- `src/hooks/use-api-data.ts` loads API-backed page data and exposes loading and error state.
- `src/lib/mock-data.ts`, `src/lib/client-store.ts`, and `src/lib/tuition-store.ts` remain for non-account browser preferences or legacy preview data; account records are managed by the backend.
- `src/lib/auth.ts` contains role-navigation helpers; UI-level role checks do not replace backend authorization.

The frontend stores the JWT in browser storage, so production deployments should consider an HttpOnly cookie session if the authentication design is changed. Backend authorization, validation, and payment verification remain authoritative. Never expose a database, JWT, Stripe, or ImgBB credential through a `NEXT_PUBLIC_` variable.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To preview the seeded tutor workspace, open `/sign-in` and use **Fill tutor demo credentials**.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Key files

- `src/app/layout.tsx` — root metadata and providers
- `src/app/globals.css` — shared visual system and responsive styling
- `src/components/providers/auth-provider.tsx` — backend session and auth state
- `src/components/dashboard.tsx` — role-aware dashboard shell and shared dashboard UI
- `src/components/tuition-browser.tsx` — search, filters, and pagination
- `src/lib/api.ts` and `src/hooks/use-api-data.ts` — authenticated API integration
- `src/types/index.ts` — domain types
