# Wakeely Pro — Work Log

## Task 3 — Zustand Store, Seed Script & i18n Translations

**Status:** ✅ Completed

### Files Created

1. **`src/stores/app-store.ts`** — Comprehensive Zustand store with full TypeScript typing
   - Interfaces: `CaseItem`, `TaskItem`, `DocumentItem`, `BillingItem`, `TimelineItem`, `ClientItem`, `ActivityItem`, `DashboardStats`, `FeatureFlags`
   - State: navigation, selected case, cases CRUD, dashboard stats, feature flags, clients, UI state (sidebar, dialogs, language, loading)
   - Actions: `setCases`, `addCase`, `updateCase`, `removeCase`, `isProMode()`, `toggleSidebar()`, etc.

2. **`src/lib/i18n.ts`** — Arabic/English translation system
   - `t(key, locale)` helper function for lookups with fallback
   - 150+ translation keys covering: navigation, case statuses/types, priorities, task/billing statuses, document categories, timeline event types, dashboard labels, common actions, cases/tasks/documents/billing/clients/settings/pro features sections

3. **`prisma/seed.ts`** — Comprehensive seed script with realistic Arabic legal data
   - 1 lawyer (عبدالله المحمدي)
   - 5 clients (3 individual, 2 corporate) with Arabic names
   - 12 cases across 6 types (civil, criminal, commercial, labor, family, real_estate) with various statuses
   - 25 tasks spread across cases
   - 15 documents with Arabic file names
   - 10 billing entries
   - 20 timeline events
   - 15 activity log entries
   - 5 feature flags

4. **`package.json`** — Added `"seed": "bun run prisma/seed.ts"` script

### Seed Results
```
👤 Lawyer:       1
👥 Clients:      5
📋 Cases:        12
✅ Tasks:        25
📄 Documents:    15
💰 Billings:     10
📅 Timeline:     20
📝 Activities:   15
🚩 Feature Flags: 5
```

### Notes
- ESLint passes clean with no errors
- Database uses SQLite via Prisma ORM
- All Arabic content uses authentic Saudi legal terminology
- Seed is idempotent (cleans all data before seeding)

---

## Task 5 — Dashboard View Component

**Status:** ✅ Completed

### Files Created

1. **`src/components/wakeely/dashboard-view.tsx`** — Main dashboard overview view for Wakeely Pro

### Component Structure

- **Pro Features Banner** — Gradient emerald/teal banner with sparkle icon, shown only when `isProMode()` is true. Lists enabled pro features (e.g., Pro Dashboard, Advanced Analytics, AI Legal Assistant) as backdrop-blur pills. Includes decorative circles for visual depth.

- **Stat Cards Row** (4 cards, responsive grid: 1→2→4 columns)
  - Total Cases (Briefcase icon, emerald)
  - Active Cases (Activity icon, amber)
  - Upcoming Hearings (Calendar icon, rose)
  - Total Revenue (DollarSign icon, emerald, formatted as `XK`)
  - Each card has icon in colored rounded container + label + value
  - Framer-motion `fadeInUp` staggered animation per card

- **Charts Row** (2 columns)
  - **Left: Cases by Status** — Recharts `BarChart` with rounded bars, custom tooltip, XAxis with i18n status labels, YAxis without decimals
  - **Right: Cases by Type** — Recharts `PieChart` (donut) with `innerRadius=60` / `outerRadius=95`, 3px padding, circle legend icons, custom tooltip
  - Both charts use semantic color mapping (emerald=active, amber=discovery, rose=trial, etc.)

- **Bottom Row** (2 columns)
  - **Left: Recent Cases** — `Table` showing top 5 recent cases with: case number (mono), title (truncated), type badge (colored pill), status badge (semantic outline), client name (truncated). Row click navigates to case detail via `setCurrentView('cases')` + `setSelectedCaseId()`.
  - **Right: Recent Activity** — Timeline feed in `ScrollArea` (max-h-96). Each item: entity-based icon in colored circle (case=emerald, task=amber, document=slate, billing=teal, client=orange, hearing=rose), description with lawyer name bold, timestamp via `date-fns` `formatDistanceToNow` with Arabic locale support.

- **Loading States** — Full skeleton placeholders for every section (stat cards, charts, table rows, activity items) displayed when `dashboardStats` is null.

### Key Features
- **RTL Support**: `dir={language === 'ar' ? 'rtl' : 'ltr'}` on root, arrow icon rotation for RTL
- **i18n**: All labels use `t()` with `language` locale — full Arabic/English support
- **Data Fetching**: `useEffect` on mount fetches `/api/dashboard` + `/api/feature-flags`, transforms API response shape to `DashboardStats` interface
- **Color System**: Emerald/teal accent on white/slate backgrounds, no blue/indigo
- **Animations**: Framer-motion staggered `fadeInUp` on all major sections
- **Accessibility**: Semantic HTML, proper table structure, ARIA-compatible

### ESLint
- Passes clean with zero errors

---

## Task 6-8 — Cases View, Case Detail View & Create Case Dialog

**Status:** ✅ Completed

### Files Created

1. **`src/components/wakeely/cases-view.tsx`** — Cases list view (CasesListView)
2. **`src/components/wakeely/case-detail-view.tsx`** — Case detail view with 5 tabs (CaseDetailView)
3. **`src/components/wakeely/create-case-dialog.tsx`** — Dialog form for creating a new case (CreateCaseDialog)

### File 1: cases-view.tsx (CasesListView)

- **Header** — Page title "Cases" + "New Case" button (emerald) that opens CreateCaseDialog
- **Search & Filters** — Card with search input (debounced 300ms) + 3 Select dropdowns (status, type, priority) in responsive row
- **Cases Table** — Full `Table` with columns: Case # (mono), Title, Client (hidden sm), Type badge (hidden md), Status badge (semantic colors), Priority badge (hidden lg), Next Hearing (hidden lg), Actions (popover menu)
- **Status Badge Colors** — 8 semantic colors: intake (slate), active (emerald), discovery (amber), trial (rose), settlement (teal), appeal (orange), closed (gray), archived (slate)
- **Priority Badge Colors** — 4 levels: low (slate), medium (amber), high (orange), urgent (rose)
- **Row Click** — Opens CaseDetailView via `setSelectedCaseId` (component conditionally renders CaseDetailView when `selectedCaseId` is set)
- **Actions Popover** — "View" and "Delete" options per row, delete calls `DELETE /api/cases/[id]` + `removeCase()`
- **Loading** — Skeleton rows while fetching; empty state with search icon when no results
- **Responsive** — Mobile-friendly with hidden columns at breakpoints, horizontal scroll via Table wrapper
- **Animations** — Framer-motion `AnimatePresence` staggered row animations

### File 2: case-detail-view.tsx (CaseDetailView)

- **Props** — `{ caseId: string }`
- **Header** — Back button (RTL-aware arrow), case number + title, status/priority badges, Edit/Delete action buttons
- **Info Grid** — 6-column responsive grid (2→3→6 cols) showing: Court, Judge, Filed Date, Next Hearing, Case Value (with currency), Client Name
- **5 Tabs** (shadcn Tabs with icons):
  - **Overview** — Description card, Notes card, Details card (type, lawyer, created/updated dates)
  - **Tasks** — ScrollArea list with checkbox toggle (PUT /api/tasks/[id] for complete/uncomplete), priority badge, due date. "Add Task" inline form (title, priority select, due date, submit). Framer-motion animated form expand/collapse.
  - **Documents** — Table (file name with icon, type badge, category, uploaded date). "Add Document" inline form (file name, type select, category select, description).
  - **Timeline** — Vertical timeline with colored dots per event type (7 types). "Add Event" inline form (title, type select, date, description). Sorted by date descending.
  - **Billing** — Table (description, hours, rate, amount, status badge, invoice date). Summary row with total. "Add Entry" inline form with auto-calculation (hours × rate = amount).
- **CRUD** — All sub-forms POST to respective API endpoints and refetch case data on success
- **Loading** — Full skeleton layout while initial case data fetches; empty states per tab
- **Toast notifications** — Success/error via sonner

### File 3: create-case-dialog.tsx (CreateCaseDialog)

- **Dialog** — Controlled by `createCaseDialogOpen` from Zustand store, max-w-2xl, scrollable content
- **Form Fields** — 14 fields organized in sections with separators:
  - Title (required, with validation error)
  - Description (textarea, 3 rows)
  - Case Type / Status / Priority (3-column select grid)
  - Court / Judge (2-column text inputs)
  - Filed Date / Next Hearing / Case Value / Client (2-column grid, date inputs + number + client select)
  - Notes (textarea, 3 rows)
  - Is Pro Case / Visible to Client (two Switch toggles in a row)
- **Defaults** — status=intake, priority=medium, caseType=civil, isPro=true, isVisibleToClient=false
- **Client Dropdown** — Fetches from `/api/clients` on dialog open if clients list is empty
- **Case Number Generation** — `WP-{YEAR}-{NNN}` format (e.g., `WP-2024-013`)
- **Submit** — POSTs to `/api/cases`, calls `addCase()` in store, shows success toast, closes dialog
- **Validation** — Title required, visual error border + message
- **Loading** — Spinner on submit button while creating

### Cross-cutting Features
- **RTL** — `dir={language === 'ar' ? 'rtl' : 'ltr'}` on all root divs, RTL-aware arrow icons (`ArrowRight`/`ArrowLeft`)
- **i18n** — All text uses `t('key', language)` — no hardcoded strings
- **Color Palette** — Emerald/teal/amber/rose/orange/slate — no blue/indigo
- **Responsive** — Mobile-first with sm/md/lg breakpoints, horizontal scroll on tables
- **ESLint** — Passes clean with zero errors

---

## Task 12 — Tasks, Clients, Billing, Pro Features & Settings Views

**Status:** ✅ Completed

### Files Created

1. **`src/components/wakeely/tasks-view.tsx`** — Task management view (TasksView)
2. **`src/components/wakeely/clients-view.tsx`** — Client management view (ClientsView)
3. **`src/components/wakeely/billing-view.tsx`** — Billing/invoice management view (BillingView)
4. **`src/components/wakeely/pro-features-view.tsx`** — Pro feature flags management (ProFeaturesView)
5. **`src/components/wakeely/settings-view.tsx`** — Application settings view (SettingsView)

### File 1: tasks-view.tsx (TasksView)

- **Card-based layout** — Tasks displayed as individual cards (not table), each with checkbox, title, description (truncated), case reference, due date, priority badge, status badge
- **Status filter tabs** — Button group for all/pending/in_progress/completed/cancelled with emerald active state
- **Checkbox completion toggle** — PUT /api/tasks/[id] with status: completed/pending, completed tasks show line-through + muted text
- **Overdue detection** — Tasks past due date (non-completed/cancelled) get rose left border (`border-s-4 border-s-rose-400`) and rose-colored date text
- **Inline add form** — Animated expand/collapse with title input, case select (from store), priority select, due date picker, submit/cancel
- **Case navigation** — Clicking case reference calls `goToCase()` which sets selectedCaseId and navigates to cases view
- **Status key mapping** — API `in_progress` mapped to i18n `taskStatus.inProgress`
- **Loading/empty states** — Skeleton cards while fetching, inbox icon empty state
- **Animations** — Framer-motion AnimatePresence staggered card entry

### File 2: clients-view.tsx (ClientsView)

- **Responsive grid** — 1/2/3 column grid (mobile/tablet/desktop) of client cards
- **Client cards** — Emerald avatar with first letter, bold name, email (with mail icon), phone (with phone icon), type badge (individual=User icon, corporate=Building2 icon), case count from `_count.cases`
- **Search** — Debounced 300ms search input filtering by name/email/phone via GET /api/clients?search=
- **Card click** — Dispatches `CustomEvent('wakeely:filterByClient')` for cross-view client filtering
- **New Client dialog** — Form with fullName (required), email, phone, nationalId, type select, address, company (conditionally shown for corporate type)
- **API integration** — GET /api/clients for list, POST /api/clients for create
- **Loading/empty states** — Skeleton card grid, inbox icon empty state
- **Animations** — Framer-motion staggered card entry with hover shadow + emerald border

### File 3: billing-view.tsx (BillingView)

- **Summary stats row** — 4 stat cards in 2x2/4-column responsive grid: Total Billed (emerald), Total Paid (teal), Outstanding (amber), Overdue (rose) — each with colored icon container
- **Status filter tabs** — all/draft/sent/paid/overdue/cancelled button group
- **Billing table** — Columns: Description, Case (hidden sm), Hours (hidden md), Rate (hidden md), Amount (formatted SAR), Status badge (hidden lg), Invoice Date (hidden lg), Actions
- **Currency formatting** — `Intl.NumberFormat` with `ar-SA`/`en-SA` locale, SAR currency
- **Auto-calculation** — Hours x Rate auto-fills Amount in add dialog
- **Summary row** — Table footer with bold total amount
- **Send action** — Draft invoices get a send button (amber) that marks them as sent via PUT
- **New Invoice dialog** — Description (required), case select, hours, rate, auto-calculated amount, status select, invoice date, due date
- **Loading/empty states** — Skeleton rows, inbox icon empty state

### File 4: pro-features-view.tsx (ProFeaturesView)

- **Header** — Sparkle icon in emerald rounded container + "Pro Features" title
- **Feature cards grid** — 2-3 column responsive grid of feature toggle cards
- **Feature list** — pro_dashboard (LayoutDashboard), advanced_analytics (BarChart3), ai_assist (Sparkles), client_portal_sync (RefreshCw), bulk_operations (Layers)
- **Toggle interaction** — Switch calls PUT /api/feature-flags with { key, enabled }, optimistic UI via store
- **Visual feedback** — Enabled cards get emerald border + subtle emerald glow (bg-emerald-50/40) + emerald icon background; disabled cards are gray
- **Animations** — Framer-motion staggered card entry, layoutId glow transition on toggle
- **i18n** — Feature names from translation keys, descriptions have Arabic-specific translations via helper function
- **Loading** — Skeleton card grid while fetching flags from GET /api/feature-flags

### File 5: settings-view.tsx (SettingsView)

- **Profile section** — Read-only display of lawyer name (Arabic), email, firm name, license number in 2-column grid
- **Language section** — Two toggle buttons (Arabic / English), active one has emerald bg, calls `setLanguage()` from store
- **Notifications section** — 5 toggle switches (email, push, task reminders, case updates, billing alerts) with separators, UI-only (no backend)
- **About section** — App branding (Scale icon, "Wakeely Pro v1.0.0"), description paragraph, tech stack badges (Next.js 16, TypeScript, Tailwind CSS, Prisma, SQLite, Zustand, shadcn/ui, Framer Motion), security note with Shield icon
- **Layout** — max-w-3xl centered, clean card layout, framer-motion staggered entrance animations

### Cross-cutting Features (all 5 files)

- **RTL** — `dir={language === 'ar' ? 'rtl' : 'ltr'}` on root wrapper
- **i18n** — All text uses `t()` with language locale
- **Status color patterns** — pending/draft: slate, in_progress/sent: amber, completed/paid: emerald, cancelled: gray, overdue: rose; priority: low: slate, medium: amber, high: orange, urgent: rose
- **Responsive** — Mobile-first with sm/md/lg breakpoints
- **Loading/empty states** — Skeletons and empty state icons
- **Animations** — Framer-motion AnimatePresence or staggered entrance
- **ESLint** — Passes clean with zero errors

---

## Task 2 — Comprehensive API Routes (Parties, Team, Comments, Time, Expenses, Calendar, Evidence, Privilege Logs, Analytics, Audit)

**Status:** ✅ Completed

### Files Created (16 API route files)

1. **`src/app/api/parties/route.ts`** — GET (?caseId=), POST
2. **`src/app/api/parties/[id]/route.ts`** — PUT, DELETE
3. **`src/app/api/team/route.ts`** — GET (list with `_count` for tasks/comments), POST (with P2002 unique email handling)
4. **`src/app/api/team/[id]/route.ts`** — PUT, DELETE
5. **`src/app/api/comments/route.ts`** — GET (?caseId=, top-level only with nested `replies`), POST (threaded via `parentId`)
6. **`src/app/api/time-entries/route.ts`** — GET (?caseId=, ?lawyerId=, ?dateFrom=, ?dateTo= with date range), POST
7. **`src/app/api/time-entries/[id]/route.ts`** — PUT, DELETE
8. **`src/app/api/expenses/route.ts`** — GET (?caseId=), POST
9. **`src/app/api/expenses/[id]/route.ts`** — PUT, DELETE
10. **`src/app/api/calendar/route.ts`** — GET (?month=, ?year=, ?caseId=), includes pseudo-events from case `nextHearing` and `statuteLimitDate`; POST
11. **`src/app/api/calendar/[id]/route.ts`** — PUT, DELETE
12. **`src/app/api/evidence/route.ts`** — GET (?caseId=), POST (JSON serialization for `tags` and `chainOfCustody`)
13. **`src/app/api/evidence/[id]/route.ts`** — PUT, DELETE
14. **`src/app/api/privilege-logs/route.ts`** — GET (?caseId=), POST
15. **`src/app/api/analytics/route.ts`** — GET (comprehensive analytics with 5 metric sections)
16. **`src/app/api/audit/route.ts`** — GET (?entity=, ?entityId=, ?limit=50) with lawyer name included

### Route Patterns
- All routes follow Next.js 16 App Router conventions with `params: Promise<{ id: string }>` pattern
- Consistent error handling: try/catch with `console.error`, P2025 → 404, P2002 → 409
- Includes: `case` relation in all case-bound entities, `lawyer` in time entries, `member` in comments/team
- All responses use `NextResponse.json()`

### Analytics Endpoint Detail
Returns comprehensive data in one response:
- **caseMetrics**: totalCases, activeCases, avgDaysToClose, casesByType, casesByStatus, casesByPriority
- **financialMetrics**: totalBilled, totalCollected, outstanding, totalExpenses, revenueByMonth (last 12 months), topBilledCases (top 5)
- **timeMetrics**: totalHoursLogged, billableHours, nonBillableHours, utilizationRate, hoursByActivityType, hoursByLawyer
- **teamMetrics**: totalMembers, activeCasesPerMember, tasksCompletedByMember
- **deadlineMetrics**: upcomingDeadlines (30 days), overdueDeadlines, statuteWarnings (60 days)

### Calendar Endpoint Detail
- GET with month/year filters returns events within that month range
- Also merges pseudo-events from cases whose `nextHearing` or `statuteLimitDate` falls in the month, marked with `_isCaseDate: true`

### ESLint
- Passes clean with zero errors
## Task 3a — Verify app-store.ts has new interfaces and state
- Reviewed `/home/z/my-project/src/stores/app-store.ts`
- All 8 new interfaces already present: `PartyItem`, `TeamMemberItem`, `CommentItem`, `TimeEntryItem`, `ExpenseItem`, `CalendarEventItem`, `EvidenceItem`, `PrivilegeLogItem`
- All new AppState properties and setters already present (parties, teamMembers, comments, timeEntries, expenses, calendarEvents, evidenceItems, privilegeLogs, activeTimer)
- All store initial state and actions already implemented
- `bun run lint` — passed cleanly, no errors

---

## Task 5 — Kanban View, Calendar View, Time Tracking View

**Status:** ✅ Completed

### Files Created

1. **`src/components/wakeely/kanban-view.tsx`** — Drag-and-drop Kanban board (KanbanView)
2. **`src/components/wakeely/calendar-view.tsx`** — Monthly calendar grid with event management (CalendarView)
3. **`src/components/wakeely/time-tracking-view.tsx`** — Timer, time entries table, and expense logging (TimeTrackingView)

### File 1: kanban-view.tsx (KanbanView)

- **4-column board** — pending | in_progress | completed | cancelled, horizontally scrollable with min-w/max-w per column
- **DnD with @dnd-kit** — `DndContext` + `SortableContext` + `useSortable` per card, `closestCorners` collision detection, `PointerSensor` with 5px activation distance
- **Task cards** — Grip handle (GripVertical), Checkbox to toggle complete, title, priority badge, due date (rose if overdue), case reference
- **Overdue tasks** — Rose left border (`border-s-4 border-s-rose-400`) matching tasks-view pattern
- **Drag → status update** — On dragEnd, detects target column, optimistic update, PUT to `/api/tasks/[id]` with new status, reverts on failure
- **Column styling** — Each column has distinct bg/border: pending (slate), in_progress (amber), completed (emerald), cancelled (gray)
- **Loading skeleton** — 4-column placeholder with skeleton cards
- **Empty state** — Inbox icon + "no tasks" message
- **RTL** — Column flex direction reversed for Arabic, dir wrapper

### File 2: calendar-view.tsx (CalendarView)

- **Monthly grid** — 7-column grid (Sat–Fri for Arabic, Sun–Sat for English), dynamic padding to fill rows
- **Day cells** — Day number in circle (today=emerald filled), up to 3 event pills with color-coded dots and truncated titles, +N overflow indicator
- **Mobile** — Dots only (no text pills) on small screens
- **Event color coding** — hearing: emerald, filing: amber, meeting: sky, deadline: rose, trial: purple, deposition: orange, mediation: teal
- **Event detail panel** — Desktop: right side sticky Card (320px) with animated entrance; Mobile: bottom Sheet with full event list
- **Event cards** — Colored top bar, title, type badge, time (Clock icon), location (MapPin icon), case reference
- **Add Event Dialog** — Title, description, eventType select (7 types), startDate, endDate, allDay toggle (Switch), location, reminder select (none/5m/15m/30m/1h/1d), caseId select
- **Navigation** — Prev/Next month buttons (RTL-aware chevrons), "Today" button, month/year label via date-fns `format`
- **Data fetching** — GET `/api/calendar?month=X&year=Y` on month change
- **date-fns** — startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, format

### File 3: time-tracking-view.tsx (TimeTrackingView)

- **3 stat cards** — Total Hours (Clock icon), Billable Hours (Timer icon), Total Billable Amount (DollarSign icon, Intl.NumberFormat SAR)
- **Timer section** — Prominent card with emerald gradient border, case select, description input, activity type select, large MM:SS timer display (monospace, tabular-nums), START/STOP button
- **Timer implementation** — setInterval 1s updates, startTime stored in ref, on stop auto-POSTs to `/api/time-entries`, cleanup on unmount
- **Time entries table** — Columns: Date, Case, Description, Activity Type (hidden md), Duration (Xh Ym), Rate (hidden sm), Amount (hidden sm), Billable badge, Delete action
- **Filters** — Case select, date range (from/to), "Log Time" manual entry button
- **Manual entry dialog** — Case, description, hours/minutes, activity type, rate, date, billable toggle
- **Expenses section** — Collapsible (Collapsible/AnimatePresence), table: Date, Case, Description, Category badge, Amount, Billable badge, Delete action
- **Add expense dialog** — Case, description, amount, category select (6 types), date, billable toggle
- **Delete** — DELETE to `/api/time-entries/[id]` and `/api/expenses/[id]` with toast
- **Currency formatting** — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' })`

### Cross-cutting Features (all 3 files)

- **RTL** — `dir={language === 'ar' ? 'rtl' : 'ltr'}` on root wrapper, RTL-aware icons/arrows
- **i18n** — All text via `t()` with language locale
- **Color palette** — Emerald/amber/rose/orange/teal/slate — no blue/indigo
- **Responsive** — Mobile-first with sm/md/lg breakpoints, ScrollArea for tables
- **Animations** — Framer-motion AnimatePresence for cards/events/rows
- **Toast** — Success/error via sonner
- **ESLint** — All 3 files pass clean (only pre-existing error in ai-assistant-view.tsx)

---

## Task 7 — Reports View, Client Portal View, Audit Trail View

**Status:** ✅ Completed

### File 1: `src/components/wakeely/reports-view.tsx` — `ReportsView`

- **5-tab analytics dashboard**: Case Metrics, Financial, Time Report, Team Performance, Deadlines
- **Tab 1 – Case Metrics**: 4 stat cards (Total/Active/Closed/Avg Days) + BarChart by Status + PieChart by Type + BarChart by Priority
- **Tab 2 – Financial**: 4 stat cards (Billed/Collected/Outstanding/Expenses) + AreaChart revenue by month + horizontal BarChart top 5 billed cases
- **Tab 3 – Time Report**: 3 stat cards (Total/Billable/Utilization %) + PieChart by activity type + BarChart by lawyer
- **Tab 4 – Team Performance**: Table (name, role, active tasks, completed) + grouped BarChart comparison
- **Tab 5 – Deadlines**: Overdue (rose) → Statute warnings (amber) → Upcoming (emerald); days-remaining badges
- **Data**: Single fetch from `GET /api/analytics` on mount
- **Charts**: recharts (BarChart, PieChart, AreaChart, Cell, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis)
- **Color palette**: emerald, amber, rose, teal, orange, purple, sky — no blue/indigo
- **Loading**: Skeleton placeholders per tab
- **RTL**: `dir={language === 'ar' ? 'rtl' : 'ltr'}` wrapper, date-fns `ar` locale for months

### File 2: `src/components/wakeely/client-portal-view.tsx` — `ClientPortalView`

- **Two-column layout**: Left (client select + case list), Right (portal config)
- **Client dropdown**: from `useAppStore().clients`
- **Case list**: filtered by selected client, shows caseNumber/title/visibility badge, clickable
- **Portal Configuration**: 5 Switch toggles (Timeline, Documents, Billing, Tasks, Comments) with icon + description
- **Summary card**: Shows visible section count with Eye/EyeOff icon
- **Actions**: "Save Configuration" (emerald, PUT `/api/cases/[id]` with `isVisibleToClient` + `clientAccessConfig` JSON) + "Preview Client View" (outline)
- **Empty states**: No client selected → shield icon; no case selected → instruction text
- **Animations**: AnimatePresence for right column transitions, loading skeletons
- **Toast**: sonner for save success/error

### File 3: `src/components/wakeely/audit-trail-view.tsx` — `AuditTrailView`

- **Top bar**: Title + entry count badge
- **Filters**: Search input, Entity select (all/case/task/document/billing/…), Action select (dynamically populated)
- **Table**: 6 columns — Timestamp (font-mono), User (name + email), Action, Entity (colored badge), Description (truncated), IP Address
- **Entity badges**: case=emerald, task=amber, document=sky, billing=rose, comment=purple, timeline=teal, evidence=orange
- **Data**: Fetches `GET /api/audit?limit=100`
- **ScrollArea**: max-h-[70vh] for the table container
- **Staggered row animation**: framer-motion with delay per row
- **Date formatting**: date-fns `format()` with `ar` locale
- **Empty state**: Filter icon + "No results" message

### Lint

- All 3 new files pass ESLint with zero errors/warnings
- Pre-existing errors in `ai-assistant-view.tsx` (refs accessed during render) are unrelated

---

## Task 6: Create 3 Wakeely Pro View Components

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Status:** ✅ Completed

### Files Created

1. **`src/components/wakeely/team-view.tsx`** — `TeamView`
   - Team management page with grid of member cards (3/2/1 responsive cols)
   - Avatar with colored initials by role (partner=emerald, senior=teal, associate=amber, paralegal=sky, trainee=purple, admin=slate)
   - Member cards: name (bold), email, phone, specialization, role badge, active cases count, active/inactive toggle (Switch), edit button
   - Add/Edit Member Dialog: name, email, role select, phone, barNumber, specialization, isActive toggle
   - CRUD operations: GET /api/team, POST /api/team, PUT /api/team/[id], DELETE /api/team/[id]
   - Delete confirmation via AlertDialog
   - Search filtering, loading skeletons, empty state, framer-motion animations

2. **`src/components/wakeely/evidence-view.tsx`** — `EvidenceView`
   - Evidence & Discovery management with table layout
   - Top bar: title, search, filter by case, filter by type, Add Evidence button
   - Filter chips: All, Documents, Photos, Videos, Physical, Digital, Testimony
   - Toggle buttons: Show Privileged Only, Show Confidential Only
   - Table columns: Title, Item Type badge, Category, Date Received, Privileged (Lock icon), Confidential (EyeOff icon), Source, Actions
   - Add/Edit Evidence Dialog: title (required), description, itemType select, category select, dateReceived, isPrivileged toggle + privilegeType select, isConfidential toggle, tags (comma-separated), source, linked case select
   - View detail dialog with full evidence info
   - CRUD operations: GET /api/evidence?caseId=, POST /api/evidence, PUT /api/evidence/[id], DELETE /api/evidence/[id]

3. **`src/components/wakeely/ai-assistant-view.tsx`** — `AIAssistantView`
   - Split view: left sidebar (w-64, collapsible) + right chat area
   - Left sidebar: Quick Actions (Summarize Case, Draft Document, Analyze Risk, Suggest Strategy), Recent Chats (4 mock titles)
   - Mobile responsive: sidebar hidden on mobile with overlay toggle
   - Chat header: AI Legal Assistant title with sparkle icon, case select dropdown
   - Messages area with ScrollArea, auto-scroll to bottom
   - Welcome message in Arabic/English based on language
   - User messages (right-aligned, emerald bg), AI responses (left-aligned, muted bg)
   - Typing indicator (3 dots animation) for 1-2 second delay
   - Keyword-matched simulated AI responses (Arabic & English keywords)
   - Auto-resize textarea (max 4 lines), send button, disabled attachment button
   - Enter to send, Shift+Enter for newline

### Patterns Used
- Import pattern: `'use client'`, `useAppStore`, `t()`, `toast`
- RTL support: `<div dir={language === 'ar' ? 'rtl' : 'ltr'}>`
- shadcn/ui components: Card, Dialog, Select, Switch, Table, ScrollArea, Badge, Skeleton, etc.
- lucide-react icons throughout
- framer-motion for card/table row animations and typing indicator
- API integration with existing backend routes
- Bilingual (Arabic/English) via i18n system
