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
  // Transactions: Disputes list
  'transactions:disputes': {
    xs: ['dispute_id', 'status', 'dispute_amount'],
    sm: ['dispute_id', 'txn_id', 'status', 'dispute_amount'],
    md: ['dispute_id', 'txn_id', 'status', 'dispute_amount', 'raised_at'],
  },
  // Transactions: Exceptions queue
  'transactions:exceptions': {
    xs: ['txn_id', 'exceptionType', 'duration'],
    sm: ['txn_id', 'exceptionType', 'duration', 'amount'],
    md: ['priority', 'txn_id', 'exceptionType', 'duration', 'amount'],
  },
  // Transactions: Refunds
  'transactions:refunds': {
    xs: ['refund_id', 'amount', 'status'],
    sm: ['refund_id', 'txn_id', 'amount', 'status'],
    md: ['refund_id', 'txn_id', 'amount', 'status', 'request_date'],
  },
  // Transactions: Settlements - Pending
  'transactions:settlements:pending': {
    xs: ['txn_id', 'paid_amount', 'settlement_amount'],
    sm: ['txn_id', 'paid_amount', 'settlement_amount', 'days_pending'],
    md: ['txn_id', 'trans_date', 'paid_amount', 'settlement_amount', 'days_pending'],
  },
  // Transactions: Settlements - History
  'transactions:settlements:history': {
    xs: ['id', 'payment_date', 'net_amount', 'payout_status'],
    sm: ['id', 'payment_date', 'net_amount', 'payout_status', 'bank_name'],
    md: ['id', 'payment_date', 'net_amount', 'payout_status', 'bank_name', 'gross_amount'],
  },
  // Transactions: Reconciliation - Overview
  'transactions:reconciliation': {
    xs: ['recon_id', 'txn_id', 'status'],
    sm: ['recon_id', 'txn_id', 'status', 'amount'],
    md: ['recon_id', 'txn_id', 'status', 'amount', 'recon_date'],
  },
  // Transactions: Reconciliation - Mismatches table
  'transactions:reconciliation:mismatches': {
    xs: ['mismatch_type', 'txn_id', 'status'],
    sm: ['mismatch_type', 'txn_id', 'system_amount', 'bank_amount', 'status'],
  },
  // Clients main table
  'clients': {
    xs: ['client_code', 'client_name', 'status'],
    sm: ['client_code', 'client_name', 'status', 'transaction_count'],
    md: ['client_code', 'client_name', 'status', 'transaction_count', 'total_volume'],
  },
  // Reports: Templates
  'reports:templates': {
    xs: ['name', 'report_type', 'format'],
    sm: ['name', 'report_type', 'format', 'description'],
  },
  // Webhooks: configurations list
  'webhooks:configs': {
    xs: ['webhook', 'url', 'status'],
    sm: ['webhook', 'url', 'status', 'lastTriggered'],
    md: ['webhook', 'url', 'status', 'performance', 'lastTriggered'],
  },
  // Compliance: documents
  'compliance:documents': {
    xs: ['title', 'doc_type', 'status'],
    sm: ['title', 'doc_type', 'status', 'due_date'],
  },
  // Admin: users
  'admin:users': {
    xs: ['username', 'email', 'is_active'],
    sm: ['username', 'email', 'role', 'is_active'],
  },
  // Admin: roles
  'admin:roles': {
    xs: ['value', 'label'],
    sm: ['value', 'label', 'count'],
  },
  // Admin: activity
  'admin:activity': {
    xs: ['user_name', 'action'],
    sm: ['user_name', 'action', 'timestamp'],
  },
  // Zones config
  'zones:config': {
    xs: ['zone_code', 'zone_name', 'zone_type'],
    sm: ['zone_code', 'zone_name', 'zone_type', 'is_active'],
    md: ['zone_code', 'zone_name', 'zone_type', 'total_users', 'total_clients', 'is_active', 'created_at'],
  },
  // Config: payment methods
  'config:payment-methods': {
    xs: ['method_name', 'is_active'],
    sm: ['method_name', 'is_active', 'processing_time'],
    md: ['method_name', 'is_active', 'processing_time', 'limits', 'performance'],
  },
  // Clients KYC
  'clients:kyc': {
    xs: ['client_code', 'client_name', 'kyc_status'],
    sm: ['client_code', 'client_name', 'client_email', 'kyc_status'],
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
