/**
 * Central UI Tokens for responsive sizing
 * Use these to avoid inline numeric styles across pages.
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Standard Recharts heights by breakpoint
export const CHART_HEIGHTS: Record<Breakpoint, number> = {
  xs: 220,
  sm: 260,
  md: 300,
  lg: 320,
  xl: 360,
  xxl: 400,
};

// Standard filter widths
export const FILTER_WIDTHS: Record<'sm' | 'md' | 'lg', number> = {
  sm: 160,
  md: 220,
  lg: 280,
};

// DatePicker control heights
export const DATEPICKER_HEIGHTS: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 36,
  lg: 40,
};

// Helper to resolve a value by breakpoint with fallbacks
export function byBreakpoint<T = number>(
  bp: Breakpoint,
  map: Partial<Record<Breakpoint, T>>,
  fallback?: T
): T {
  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const idx = order.indexOf(bp);
  for (let i = idx; i >= 0; i--) {
    const val = map[order[i]];
    if (val !== undefined) return val as T;
  }
  return (fallback as T) ?? (map.md as T);
}

