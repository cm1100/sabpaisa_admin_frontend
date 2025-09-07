/**
 * Catch-all route for dashboard subroutes
 * Renders the same dashboard component for all paths like:
 * - /dashboard/overview
 * - /dashboard/analytics
 * - /dashboard/reports
 * - /dashboard/metrics
 * etc.
 */

import DashboardPage from '../page';

export default function DashboardSubroutePage() {
  return <DashboardPage />;
}