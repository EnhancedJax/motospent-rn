# Motospent

A motorcycle expense & maintenance tracker. Works fully offline. Mobile only.

## `src/` structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── container/
│   ├── expenses/
│   │   └── container/
│   └── settings/
│       └── container/
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

**`src/app/<route>/container/`** — UI that belongs to a single tab or route subtree. Put a component here when it is only used under that subroute (e.g. dashboard-only widgets in `app/dashboard/container/`, expense-list rows in `app/expenses/container/`).

Prefer `container/` over `components/` when scoping is limited to one tab. Prefer `components/` when the same piece of UI could appear on more than one screen.
