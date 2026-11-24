# MentorLagbe frontend structure

```text
src/
├── app/
│   ├── (auth)/sign-in, sign-up/       # account entry
│   ├── (payment)/payment/...          # subscription results
│   ├── (public)/pricing, tuitions/    # discovery and public information
│   ├── dashboard/
│   │   ├── student/                   # overview, applications, saved tuitions
│   │   ├── tutor/                     # overview, post, listings, applicants
│   │   ├── admin/                     # overview, users, review, transactions
│   │   └── profile/                   # shared profile editor
│   ├── error.tsx, loading.tsx, not-found.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       # landing page
├── components/
│   ├── forms/                         # auth, application, profile, tuition forms
│   ├── providers/                     # demo session context
│   ├── ui/                            # toast provider and shared controls
│   └── ...                            # navigation, cards, dashboards, page modules
├── hooks/                             # reusable React hooks
├── lib/                               # API boundary, demo data, browser stores, helpers
└── types/                             # shared domain types
```

The `server/` folder is intentionally not part of this frontend phase. Route groups `(auth)`, `(payment)`, and `(public)` do not add URL segments.
