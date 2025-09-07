# UI Mobile Responsiveness – Work Log and Plan

This file tracks decisions, changes, and the step‑by‑step plan to make the SabPaisa Admin frontend excellent on mobile. It is the single place to continue work every session.

Owner: UI/Frontend
Date started: 2025‑09‑07

## Scope & Goals

- No horizontal scrolling on mobile (<= 767px) across all modules
- Header fits on one line without overflowing
- Charts never overflow; readable labels and tooltips on touch
- Tables readable: only core columns by default on mobile, with horizontal scroll where needed
- Actions are discoverable via compact buttons or “More” menu on mobile

## Environment

- Frontend (Amplify): https://main.d19zmd6ccrhdjj.amplifyapp.com/
- API base: `NEXT_PUBLIC_API_URL=https://d3clrg8iev0e9q.cloudfront.net/api`

## Centralization Strategy

We will fix once, apply everywhere:

1) Global layout and header (MainLayout) – compact right actions on mobile.
2) Shared breakpoints and spacing (`useResponsive`, `ResponsiveGrid/Row/Container`).
3) Shared table wrapper (`CentralTable`) + ColumnPolicy registry to prune columns on small screens.
4) Shared chart wrapper (`ResponsiveChart`) + ChartPolicy to enforce safe mobile defaults (confine tooltips, contain labels, rotate x‑axis labels, smaller legend, standard heights).
5) Shared “ResponsiveHeaderActions” component (to be added) so pages only declare actions; mobile collapses into “More.”

## Implemented (commits)

- Header: compact on mobile, avatar‑only profile; fewer icons; wrap to prevent overflow
  - File: `components/layouts/MainLayout.tsx`
  - Commit: `ef7b03d` – fix(ui): compact header on mobile (hide search, help, language, theme; avatar‑only profile) and prevent overflow

- ProLayout mobile tuning: top layout on mobile, headerHeight=56, fixedHeader=false, slimmer sider
  - File: `components/layouts/MainLayout.tsx`
  - Commit: `2f98506` – feat(ui/mobile): top layout + shorter header on mobile; compact dashboard header extra with More menu

- Dashboard header “extra”: compact on mobile (Refresh + More menu for range/export/settings/auto‑refresh)
  - File: `app/(dashboard)/dashboard/page.tsx`
  - Commit: `2f98506`

- Dashboard charts: reduced heights on mobile; disable row animations on mobile sections
  - File: `app/(dashboard)/dashboard/page.tsx`
  - Commit: `39ffb9e` – feat(ui/mobile): smaller chart heights, disable row animations on mobile, prune top‑clients table columns on mobile

- Dashboard table (Top Clients): mobile default shows Client + Volume only
  - File: `app/(dashboard)/dashboard/page.tsx`
  - Commit: `39ffb9e`

## Planned Central Components (next)

1) ResponsiveHeaderActions (new)
- API:
  ```tsx
  <ResponsiveHeaderActions
    primary={[{ key: 'refresh', icon: <ReloadOutlined/>, onClick }, ...]}
    secondary={[{ key: 'export', label: 'Export', icon: <ExportOutlined/>, onClick }, ...]}
    range={{ value: timeRange, onChange: setTimeRange, options: ['24h','7d','30d','90d'] }}
  />
  ```
- Behavior: On mobile collapses secondary into “More” menu; hides search input; icon‑only where applicable.

2) ColumnPolicy registry (new)
- Shape:
  ```ts
  export const ColumnPolicy: Record<string, {
    xs?: string[]; sm?: string[]; md?: string[]; lg?: string[];
  }> = {
    'transactions:main': { xs: ['txn_id','amount','status'], md: ['txn_id','amount','status','client','mode'] },
    'dashboard:topClients': { xs: ['name','volume'], md: ['name','volume','growth'] }
  };
  ```
- Integration: `CentralTable` reads `id` and hides columns not present for current breakpoint.

3) ChartPolicy (extend ResponsiveChart)
- Defaults enforced: `containLabel: true`, `tooltip.confine: true`, rotate x‑labels on mobile, legend bottom + smaller font, standard heights by breakpoint.

## Module‑by‑Module Checklist (sidebar order)

Legend: [ ] pending, [~] partial, [x] done

1) Dashboard
- [x] Header compact on mobile
- [x] Charts stacked and resized (main/side/success rate)
- [x] Top clients table pruned on mobile
- [ ] Apply ColumnPolicy hook instead of inline pruning

2) Transactions (All, Failed, Live, Analytics, Disputes, Exceptions, Refunds, Reconciliation, Settlements)
- [ ] Header compact (filters into drawer; actions into More)
- [ ] ColumnPolicy for main tables (txn_id, amount, status on xs)
- [ ] Charts (Live/Analytics) heights reduced; stack; ChartPolicy applied

3) Clients
- [ ] Header compact
- [ ] ColumnPolicy (client name/code/status)

4) Settlements (Overview, Process, Reconciliation, Bank‑Wise, Disputes)
- [ ] Header compact
- [ ] ColumnPolicy for batch lists
- [ ] Charts resized/stacked; ChartPolicy

5) Reports
- [ ] Header compact; generator controls grouped
- [ ] ColumnPolicy for report lists

6) Config (Payment Methods, Gateways, Routing, Fees, Templates)
- [ ] Forms become single‑column on mobile; compact action bars
- [ ] ColumnPolicy for lists

7) Webhooks, Notifications, Integration
- [ ] ColumnPolicy for lists; compact headers

8) Compliance
- [ ] Dashboard charts stacked; alert tables pruned; filters into drawer

9) Admin, Zones
- [ ] Tables pruned; forms single‑column; compact header

## Acceptance Criteria (mobile)

- No horizontal scrolling at 360–414px widths
- Header stays within one line; avatar fully visible
- Charts contained; tooltips don’t overflow viewport
- 44px tap targets for interactive controls
- Key flows (Dashboard load < 3s on 4G; table scroll smooth; filters accessible)

## How to Continue (daily playbook)

1) Build central component (e.g., ResponsiveHeaderActions) and wire into `MainLayout` and one target page.
2) Apply ColumnPolicy for target module tables (IDs noted above) and verify on mobile.
3) Apply ChartPolicy via `ResponsiveChart` props/option transforms and verify labels/tooltips.
4) Commit with clear messages and add a bullet under “Changelog” below.
5) Push to `main` – Amplify will auto‑deploy (~5–10 min). Validate on device.

## Changelog

- 2025‑09‑07: Header compact on mobile; avatar‑only; fewer icons; wrap (ef7b03d)
- 2025‑09‑07: ProLayout mobile tuning; shorter header; dashboard “extra” compact (2f98506)
- 2025‑09‑07: Dashboard charts reduced heights; disabled row animations; top clients pruned (39ffb9e)

## Notes

- Keep using `layout='top'` on mobile to save vertical space; review per page if we need fixed header for specific flows.
- Prefer icon‑only buttons on mobile; move secondary actions into a More dropdown.

