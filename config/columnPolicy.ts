/**
 * ColumnPolicy registry
 * Defines which columns should be visible per breakpoint for each table id.
 * Keys are column keys or dataIndex values.
 */

export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const ColumnPolicy: Record<string, Partial<Record<BreakpointKey, string[]>>> = {
  // Dashboard: Top Clients table
  'dashboard:topClients': {
    xs: ['name', 'volume'],
    sm: ['name', 'volume'],
    md: ['name', 'volume', 'growth'],
  },
  // Transactions main table
  'transactions:main': {
    xs: ['txn_id', 'amount', 'status'],
    sm: ['txn_id', 'amount', 'status', 'client_code'],
    md: ['txn_id', 'amount', 'status', 'client_code', 'payment_mode'],
  },
};

/**
 * Utility: Return allowed column keys for a table and breakpoint.
 */
export function getAllowedColumns(policyId: string, bp: BreakpointKey): string[] | undefined {
  const policy = ColumnPolicy[policyId];
  if (!policy) return undefined;
  // Fallback from smaller to larger
  const order: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const idx = order.indexOf(bp);
  for (let i = idx; i >= 0; i--) {
    const list = policy[order[i]];
    if (list && list.length) return list;
  }
  return undefined;
}

