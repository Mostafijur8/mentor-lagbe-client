# MentorLagbe — Frontend

MentorLagbe is a responsive tuition discovery and mentorship frontend for students, tutors, and platform admins. It is built with Next.js App Router, React, TypeScript, and a small custom design system.

**Live preview:** [mentorlagbe-client.vercel.app](https://mentorlagbe-client.vercel.app)

## Current scope

This repository contains the frontend phase only. Authentication, listings, applications, bookmarks, and dashboard actions use browser demo storage so the complete interface can be reviewed before the Express/MongoDB/BetterAuth/Stripe backend is built. Demo storage is not secure authentication or production persistence.

## Run locally

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Demo workspaces

On `/sign-in`, choose a preview role and use **Fill a demo account**. The demo form accepts any non-empty password.

- Student: `ayesha@example.com`
- Tutor: `nafisa@example.com`
- Admin: `admin@mentorlagbe.com`

The demo sign-in accepts any non-empty password. These are browser-preview accounts, not production credentials.

## Main features

- Responsive landing page, public navigation, and footer with the current X mark.
- Tuition discovery with title/subject search, subject/class/mode filters, and pagination.
- Tuition details and student-only application flow with duplicate prevention.
- Student dashboard, application cancellation, and saved tuitions (Free plan limit: 5).
- Tutor dashboard, tuition posting, image preview/upload, listing CRUD, and applicant decisions.
- Admin dashboard, tuition review, member role preview, and transaction ledger.
- Student/tutor Pro pricing preview, profile editing, accessible toast feedback, loading and recovery pages.
- Dark/light theme toggle and tuition reviews for students with an accepted application.
- Twelve approved demo tuitions plus realistic connected user/application/payment examples.

## Frontend environment

Copy `.env.example` to `.env.local` and set values when needed:

- `NEXT_PUBLIC_API_URL` — future Express API base URL.
- `NEXT_PUBLIC_IMGBB_API_KEY` — optional ImgBB browser preview upload. `NEXT_PUBLIC_` values are visible in the browser; move upload credentials behind the backend before production.

No payment or authentication secrets are stored in the frontend.

## Packages

- Runtime: `next`, `react`, `react-dom`
- UI and motion: `lucide-react`, `motion`
- Styling and build: `tailwindcss`, `@tailwindcss/turbopack`, `babel-plugin-react-compiler`
- Development and checks: `typescript`, `eslint`, `eslint-config-next`, `@types/node`, `@types/react`, `@types/react-dom`

## Useful commands

- `npm run dev` — local development server.
- `npm run lint` — ESLint.
- `npx tsc --noEmit` — TypeScript check.
- `npm run build` — production build.

## Main routes

- Public: `/`, `/tuitions`, `/tuitions/[id]`, `/pricing`
- Account: `/sign-in`, `/sign-up`
- Payment states: `/payment/success`, `/payment/cancel`
- Student: `/dashboard/student`, `/dashboard/student/my-applications`, `/dashboard/student/saved-tuitions`
- Tutor: `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/dashboard/tutor/my-tuitions`, `/dashboard/tutor/applicants`
- Admin: `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/tuitions`, `/dashboard/admin/transactions`
- Shared account: `/dashboard/profile`
