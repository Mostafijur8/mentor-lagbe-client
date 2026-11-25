# MentorLagbe — Frontend

MentorLagbe is a responsive tuition discovery and mentorship app for students, tutors, and platform admins. This repository contains the Next.js frontend; the sibling [`mentor-lagbe-server`](../mentor-lagbe-server) repository provides the Express/MongoDB API.

**Live app:** [mentor-lagbe-client-rose.vercel.app](https://mentor-lagbe-client-rose.vercel.app)  
**Live API:** [mentor-lagbe-server-seven.vercel.app/api](https://mentor-lagbe-server-seven.vercel.app/api)

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.com` | `Admin12345!` |
| Tutor (Pro) | `rahim.tutor@example.com` | `Password123!` |
| Student | `ayesha.student@example.com` | `Password123!` |

The backend seed creates 6 tutors, 8 students, 12 approved tuitions, applications, reviews, and payments. Run it once with the server running:

```powershell
Set-Location ..\mentor-lagbe-server
npm run seed
```

## Features

- Landing page, public navigation, and footer with responsive layouts.
- Server-side tuition search, subject/class/mode filters, and pagination.
- Tuition details and a student application flow with duplicate prevention.
- Student dashboard, application cancellation, and saved tuitions (Free limit: 5).
- Tutor dashboard, tuition posting with ImgBB upload, listing CRUD, and applicant decisions.
- Admin dashboard for tuition moderation, role management, and the payment ledger.
- Stripe Checkout for role-specific Pro plans, verified on the success page.
- Profile editing with image upload, reviews, toasts, and dark/light themes.
- Better Auth email/password accounts bridged to the Express API with JWT.

## Authentication architecture

1. Better Auth handles sign-up, sign-in, and the browser session cookie.
2. `src/app/api/auth/token/route.ts` verifies that session and issues a JWT for the Express API.
3. `src/components/providers/auth-provider.tsx` stores the JWT and loads the authoritative profile from `GET /api/auth/me`.
4. The Express `users` collection owns role, plan, and bookmarks. Role changes and Pro upgrades take effect without signing in again.

`JWT_SECRET` must be identical in the client and server environments.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

In a second terminal:

```powershell
Set-Location ..\mentor-lagbe-server
Copy-Item .env.example .env
npm install
npm run dev
npm run seed
```

Open `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb://127.0.0.1:27017/mentorLagbe
DB_NAME=mentorLagbe
BETTER_AUTH_SECRET=replace-with-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
JWT_SECRET=replace-with-the-same-secret-as-the-server
JWT_EXPIRES_IN=7d
```

`NEXT_PUBLIC_API_URL` is public. Never put MongoDB, JWT, Stripe, or ImgBB secrets in a `NEXT_PUBLIC_` variable.

## Packages

- Framework: `next`, `react`, `react-dom`
- Auth and data: `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `jsonwebtoken`, `bcryptjs`
- UI: `lucide-react`, `motion`
- Styling and build: `tailwindcss`, `@tailwindcss/turbopack`, `babel-plugin-react-compiler`
- Checks: `typescript`, `eslint`, `eslint-config-next`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/jsonwebtoken`, `@types/bcryptjs`

## Main routes

- Public: `/`, `/tuitions`, `/tuitions/[id]`, `/pricing`
- Account: `/sign-in`, `/sign-up`
- Payment states: `/payment/success`, `/payment/cancel`
- Student: `/dashboard/student`, `/dashboard/student/my-applications`, `/dashboard/student/saved-tuitions`
- Tutor: `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/dashboard/tutor/my-tuitions`, `/dashboard/tutor/applicants`
- Admin: `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/tuitions`, `/dashboard/admin/transactions`
- Shared account: `/dashboard/profile`

## Useful commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

The app is deployed on Vercel. Set the environment variables above in the project settings, then redeploy so `NEXT_PUBLIC_API_URL` is baked into the browser bundle. `BETTER_AUTH_URL` should be the public frontend URL.
