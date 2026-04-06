

# Pongratz Properties — React + Supabase Build Plan

This plan converts the monolithic HTML rental management app into a modern React application with Supabase backend, starting with the app shell and four core modules.

## Architecture Overview

```text
┌─────────────────────────────────────────────────┐
│  App Shell (TopBar + Sidebar + Main Content)    │
├──────┬──────────────────────────┬───────────────┤
│ Side │     Main Content Area    │  Right Panel  │
│ bar  │  (routed views below)    │  (optional)   │
│      │                          │               │
│ Home │  Home / ToDo / Tenants   │  Quick stats  │
│ ToDo │  Maintenance / Acctg     │  & activity   │
│ ...  │                          │               │
└──────┴──────────────────────────┴───────────────┘
```

## Phase 1 — Database & Auth Setup

Create Supabase tables via migrations:
- `tenants` (name, phone, email, property, unit, balance, status)
- `work_orders` (property, unit, issue, priority, assigned_to, due_date, status)
- `tasks` (text, time, date, assignee, priority, status, completed_at)
- `workers` (name)
- `ledger_entries` (date, type, amount, tenant, property, unit, method)
- `rental_history` (property, unit, tenant, move_in, move_out, status)

All tables include `user_id` with RLS policies so each user sees only their own data. No auth login/signup UI initially — we can add that later.

## Phase 2 — App Shell & Navigation

- **Layout component**: 3-column grid (72px sidebar | flex main | optional right panel)
- **TopBar**: Gradient header with search bar, brand mark "Pongratz Properties", avatar, notification bell
- **Sidebar**: Icon-based navigation with colored icons matching the HTML (Home=orange, ToDo=cyan, Tenants=purple, Maintenance=red, Accounting=green, etc.). Uses the existing shadcn Sidebar component
- **Home view**: iOS-style app launcher grid with gradient icon tiles and category tabs (All, Pinned, Featured, etc.)

## Phase 3 — Core Modules

### 3a. To Do List
- Task creation toolbar (text, time, date, assignee, priority)
- Task list with checkboxes, priority badges, assignee pills
- Filter tabs (All / Open / Completed)
- Worker/Assignee manager panel (add/remove people)
- Stats cards (Open count, Completed count)

### 3b. Tenants
- Add tenant form (name, phone, email, property, unit, balance, status)
- Searchable/filterable table with all tenant fields
- Active/Former status toggle

### 3c. Maintenance
- Work order creation (property, unit, issue, priority, assigned, due date, status)
- Table with search and status filters (Open / In Progress / Done)
- Priority badges (Low/Med/High)

### 3d. Accounting
- **Sub-tabs**: P/L Dashboard, Import, Ledger, Balance Sheet, Income Statement, Cash Flow, Owner's Equity
- **P/L Dashboard**: KPI cards (Revenue, Expenses, Profit) + chart placeholders (using recharts)
- **Ledger**: Add entries, search, date range filter, summary panel, CSV export
- **Balance Sheet**: Editable two-column table (Current vs Prior year) with auto-totals
- **Rental History**: Add/view lease records

## Phase 4 — Styling & Polish

- Match the HTML's design system: soft gradient background, glassmorphism sidebar, rounded 18px cards, blue accent color (#2563eb)
- Custom CSS variables in index.css matching the HTML's `:root` variables
- Smooth hover transitions, pill-shaped tabs, frosted glass panels
- Responsive layout that collapses right panel on smaller screens

## Technical Details

- **State management**: React Query for Supabase data fetching/mutations
- **Routing**: React Router with sidebar navigation driving view switches
- **Charts**: Recharts library for accounting charts (bar, line, doughnut)
- **Components**: Leverage existing shadcn/ui components (Card, Table, Button, Input, Tabs, Badge) plus custom components for the app launcher grid and KPI cards
- **File structure**:
  - `src/components/layout/` — AppShell, TopBar, AppSidebar
  - `src/pages/` — Home, ToDo, Tenants, Maintenance, Accounting
  - `src/components/accounting/` — PLDashboard, Ledger, BalanceSheet, etc.
  - `src/hooks/` — useTenants, useWorkOrders, useTasks, useLedger

## Build Order

1. Supabase migrations (all tables + RLS)
2. App shell (layout, sidebar, topbar, routing)
3. Home page with app launcher grid
4. Tenants module
5. Maintenance module
6. To Do List module
7. Accounting module (P/L dashboard first, then ledger, then balance sheet)

This will be built incrementally across multiple prompts to keep changes manageable.

