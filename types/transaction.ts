/**
 * Transaction Type Definitions
 * Following TypeScript best practices with strict typing
 * Based on actual database schema with 106 fields
 */

/**
 * Main Transaction Interface
 * Represents the complete transaction data from transaction_detail table
 */
export interface ITransaction {
  // Transaction Identification
  txn_id: string;
  client_txn_id?: string;
  pg_txn_id?: string;
  bank_txn_id?: string;
  sabpaisa_txn_id?: string;
  transaction_tracker_id?: string;
  challan_no?: string;
  arn?: string;
  
  // Client Information
  client_id?: string;
  client_code?: string;
  client_name?: string;
  mapping_id?: string;
  
  // Amount Information
  amount?: number; // UI convenience alias for paid_amount
  payee_amount?: number;
  paid_amount?: number;
  act_amount?: number;
  pg_return_amount?: number;
  donation_amount?: number;
  
  // Fee Structure
  convcharges?: number;
  ep_charges?: number;
  gst?: number;
  conv_gst?: number;
  endpoint_gst?: number;
  total_fees?: number;
  
  // Settlement Information
  settlement_amount?: number;
  effective_settlement_amount?: number;
  settlement_bank_amount?: number;
  is_settled: boolean;
  settlement_status?: string;
  settlement_date?: string;
  settlement_utr?: string;
  net_amount?: number;
  
  // Payment Information
  payment_mode?: string;
  pg_pay_mode?: string;
  payment_mode_id?: string;
  endpoint_id?: string;
  pg_name?: string;
  bank_name?: string;
  card_brand?: string;
  vpa?: string;
  vpa_remarks?: string;
  
  // Customer Details
  payee_first_name?: string;
  payee_mid_name?: string;
  payee_lst_name?: string;
  payee_name?: string;
  payee_email?: string;
  payee_mob?: string;
  reg_number?: string;
  program_id?: string;
  
  // Status Information
  status?: string;
  pg_response_code?: string;
  sabpaisa_resp_code?: string;
  sabpaisa_errorcode?: string;
  bank_errorcode?: string;
  resp_msg?: string;
  bank_message?: string;
  pg_message?: string;
  status_message?: string;
  
  // Refund Information
  refund_status_code?: string;
  refund_date?: string;
  refunded_date?: string;
  refund_message?: string;
  refund_reason?: string;
  refunded_amount?: number;
  refund_amount?: number;
  is_refundable?: boolean;
  
  // Chargeback Information
  is_charge_back?: boolean;
  charge_back_amount?: number;
  charge_back_date?: string;
  charge_back_status?: string;
  has_chargeback?: boolean;
  
  // Timestamps
  trans_date?: string;
  trans_complete_date?: string;
  enquiry_date?: string;
  
  // Additional Information
  formatted_amount?: string;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
  
  // Related Data (populated on detail view)
  settlement_details?: ISettlementDetails;
  refund_details?: IRefundDetails[];
  reconciliation?: IReconciliation;
}

/**
 * Transaction Filter Interface
 * For filtering transactions in list view
 */
export interface ITransactionFilter {
  status?: string;
  client_code?: string;
  payment_mode?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  is_settled?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * Transaction Statistics Interface
 */
export interface ITransactionStats {
  total_transactions: number;
  successful: number;
  failed: number;
  pending: number;
  total_amount: number;
  success_rate: number;
  payment_modes: IPaymentModeStats[];
  date_range: string;
  start_date: string;
  end_date: string;
}

/**
 * Payment Mode Statistics
 */
export interface IPaymentModeStats {
  payment_mode: string;
  count: number;
  amount: number;
}

/**
 * Settlement Details Interface
 */
export interface ISettlementDetails {
  settlement_date?: string;
  net_amount: number;
  gross_amount: number;
  fees: number;
  gst: number;
  payout_status: boolean;
  bank_name?: string;
}

/**
 * Settlement Interface
 */
export interface ISettlement {
  // Item-level fields (used in history table)
  id?: string;
  transaction_id?: string;
  payment_date?: string;
  bank_name?: string;
  gross_amount?: number;
  conv_fee?: number;
  gst_fee?: number;
  pipe_fee?: number;
  net_amount: number;
  payout_status?: boolean;
  settlement_utr?: string | null;
  status?: string;
  created_on?: string;

  // Aggregate fields (used in stats widgets)
  total_count?: number;
  total_amount?: number;
  total_fees?: number;
}

/**
 * Refund Details Interface
 */
export interface IRefundDetails {
  refund_id: string;
  amount: number;
  reason: string;
  status: string;
  request_date?: string;
  approved_by?: string;
  bank_ref?: string;
}

/**
 * Refund Interface
 */
export interface IRefund {
  refund_id: string;
  txn_id: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  request_date: string;
  approved_by?: string;
  approved_date?: string;
}

/**
 * Refund Request Interface
 */
export interface IRefundRequest {
  txn_id: string;
  amount: number;
  reason: string;
  refund_type?: 'FULL' | 'PARTIAL';
}

/**
 * Reconciliation Interface
 */
export interface IReconciliation {
  bank_ref?: string;
  bank_amount: number;
  our_amount: number;
  difference: number;
  status: string;
  recon_date?: string;
  remarks?: string;
}

/**
 * Dispute Interface
 */
export interface IDispute {
  dispute_id?: string;
  txn_id: string;
  dispute_type: 'CHARGEBACK' | 'FRAUD' | 'DUPLICATE' | 'QUALITY' | 'UNAUTHORIZED' | 'OTHER';
  reason: string;
  amount: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED' | 'CLOSED';
  date?: string;
  remarks?: string;
}

/**
 * Analytics Interface
 */
export interface IAnalytics {
  // Flexible analytics DTO to accommodate multiple shapes
  label?: string;
  name?: string;
  payment_mode?: string;
  client_code?: string;
  client_name?: string;
  hour?: string;
  count?: number;
  value?: number;
  amount?: number;
  transaction_count?: number;
  total_amount?: number;
  avg_amount?: number;
  success_rate?: number;
  percentage?: number;
}

/**
 * Paginated Response Interface
 */
export interface IPaginatedResponse<T> {
  results: T[];
  count: number;
  next: boolean;
  previous: boolean;
  total_pages: number;
  current_page: number;
  aggregates?: {
    total_amount?: number;
    total_transactions?: number;
    avg_amount?: number;
    total_fees?: number;
  };
}

/**
 * Transaction Status Enum
 */
export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

/**
 * Payment Mode Enum
 */
export enum PaymentMode {
  UPI = 'UPI',
  CREDIT_CARD = 'CC',
  DEBIT_CARD = 'DC',
  NET_BANKING = 'NB',
  WALLET = 'WAL',
  CASH = 'CASH',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS'
}

/**
 * Refund Status Enum
 */
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

/**
 * Settlement Status Enum
 */
export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Type guards for runtime type checking
 */
export const isTransaction = (obj: any): obj is ITransaction => {
  return obj && typeof obj.txn_id === 'string';
};

export const isRefund = (obj: any): obj is IRefund => {
  return obj && typeof obj.refund_id === 'string' && typeof obj.txn_id === 'string';
};

export const isSettlement = (obj: any): obj is ISettlement => {
  return obj && typeof obj.total_amount === 'number';
};
