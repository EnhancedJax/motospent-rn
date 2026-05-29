# Motospent

A motorcycle expense & maintenance tracker. Works fully offline. Mobile only.

## `src/` structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── _container/
│   ├── expenses/
│   │   └── _container/
│   └── settings/
│       └── _container/
├── app-backend/
│   ├── errors/
│   ├── expenses/
│   ├── maintenance-reminders/
│   ├── motorcycles/
│   ├── odometer/
│   ├── settings/
│   └── standard-expense-items/
├── components/
│   ├── settings/
│   └── ui/
├── constants/
├── core/
│   ├── database/
│   │   ├── models/
│   │   ├── query/
│   │   ├── repositories/
│   │   └── seed/
│   └── units/
├── hooks/
├── providers/
├── stores/
└── theme/
```

## Components vs. containers

**`src/components/`** — Shared UI used across multiple routes or features. Examples: layout primitives, themed wrappers, tab chrome, generic form controls in `ui/`.

**`src/app/<route>/_container/`** — UI that belongs to a single tab or route subtree. Put a component here when it is only used under that subroute (e.g. dashboard-only widgets in `app/dashboard/_container/`, expense-list rows in `app/expenses/_container/`). The leading underscore excludes the folder from Expo Router.

Prefer `_container/` over `components/` when scoping is limited to one tab. Prefer `components/` when the same piece of UI could appear on more than one screen.

## Date display

Use [`formatAppDate`](src/core/format/format-app-date.ts) for every user-visible date (lists, forms, dashboard, expenses). Do not add alternate date formatters (e.g. raw `yyyy-MM-dd` or locale-only `Intl` in screens). Relative labels (“Today”, “Yesterday”, weekday) and older absolute dates follow that helper app-wide.
