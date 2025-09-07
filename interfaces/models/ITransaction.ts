/**
 * Transaction domain model interfaces
 */
import { IEntity, IStatusable } from '../base/IEntity';

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  INITIATED = 'INITIATED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED'
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  NET_BANKING = 'NET_BANKING',
  UPI = 'UPI',
  WALLET = 'WALLET',
  EMI = 'EMI',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS'
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  SETTLEMENT = 'SETTLEMENT',
  PAYOUT = 'PAYOUT',
  TRANSFER = 'TRANSFER'
}

/**
 * Base transaction interface
 */
export interface ITransaction extends IEntity, IStatusable {
  // Transaction Identifiers
  transactionId: string;
  referenceId: string;
  orderId?: string;
  invoiceId?: string;
  
  // Client Information
  clientId: string;
  clientCode: string;
  clientName: string;
  
  // Customer Information
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Transaction Details
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  
  // Fee Information
  platformFee: number;
  gatewayFee: number;
  taxAmount: number;
  netAmount: number; // Amount after fees
  settlementAmount: number; // Amount to be settled
  
  // Status Information
  status: TransactionStatus;
  statusHistory: ITransactionStatusHistory[];
  failureReason?: string;
  failureCode?: string;
  
  // Gateway Information
  gatewayId: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  gatewayStatus?: string;
  
  // Bank Information
  bankReferenceNumber?: string;
  bankName?: string;
  cardType?: string;
  cardNumber?: string; // Masked
  cardNetwork?: string;
  
  // UPI Information
  upiId?: string;
  upiApp?: string;
  
  // Wallet Information
  walletName?: string;
  walletBalance?: number;
  
  // Settlement Information
  settlementId?: string;
  settlementDate?: Date;
  settlementStatus?: string;
  isSettled: boolean;
  
  // Refund Information
  isRefundable: boolean;
  refundedAmount?: number;
  refundTransactionIds?: string[];
  parentTransactionId?: string; // For refund transactions
  
  // Risk & Compliance
  riskScore?: number;
  fraudStatus?: string;
  complianceFlags?: string[];
  
  // Additional Information
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: ILocation;
  
  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

/**
 * Transaction status history
 */
export interface ITransactionStatusHistory {
  status: TransactionStatus;
  timestamp: Date;
  reason?: string;
  updatedBy?: string;
}

/**
 * Location interface
 */
export interface ILocation {
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Transaction summary interface
 */
export interface ITransactionSummary {
  date: Date;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  successVolume: number;
  failedVolume: number;
  avgTransactionValue: number;
  successRate: number;
  paymentMethodBreakdown: IPaymentMethodSummary[];
}

/**
 * Payment method summary
 */
export interface IPaymentMethodSummary {
  paymentMethod: PaymentMethod;
  count: number;
  volume: number;
  successRate: number;
}

/**
 * Transaction search parameters
 */
export interface ITransactionSearchParams {
  transactionId?: string;
  referenceId?: string;
  clientId?: string;
  customerId?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: Date;
  toDate?: Date;
  isSettled?: boolean;
  settlementId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Refund request DTO
 */
export interface IRefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
  requestedBy: string;
  metadata?: Record<string, any>;
}

/**
 * Transaction metrics interface
 */
export interface ITransactionMetrics {
  period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: Date;
  endDate: Date;
  totalCount: number;
  successCount: number;
  failureCount: number;
  totalVolume: number;
  successVolume: number;
  avgResponseTime: number;
  peakHour?: string;
  peakVolume?: number;
  methodDistribution: Record<PaymentMethod, number>;
  statusDistribution: Record<TransactionStatus, number>;
  topClients: IClientTransactionSummary[];
}

/**
 * Client transaction summary
 */
export interface IClientTransactionSummary {
  clientId: string;
  clientName: string;
  transactionCount: number;
  totalVolume: number;
  successRate: number;
}