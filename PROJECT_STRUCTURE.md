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
│   ├── providers/                     # backend session context
│   ├── ui/                            # toast provider and shared controls
│   └── ...                            # navigation, cards, dashboards, page modules
├── hooks/                             # API data, session, and toast hooks
├── lib/                               # API boundary, demo data, browser preferences, helpers
└── types/                             # shared domain types
```

The backend API is maintained in the sibling `mentor-lagbe-server` repository. Route groups `(auth)`, `(payment)`, and `(public)` do not add URL segments.
