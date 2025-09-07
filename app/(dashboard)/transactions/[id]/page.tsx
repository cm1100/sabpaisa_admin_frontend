/**
 * Transaction Detail Page
 * Following SOLID principles and Next.js 15 best practices
 * Single Responsibility: Display detailed information for a single transaction
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, CentralButton, CentralPageContainer, CentralTag, CentralText, CentralTextArea, CentralTitle, Descriptions, Divider, Form, Input, InputNumber, Modal, PageContainer, Spin, StyledCard, StyledSpace, StyledStatistic, Timeline, App } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
// Removed pro-components import - using centralized components
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RollbackOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { transactionService } from '@/services/api/transactionService';
import type { ITransaction, IRefundRequest } from '@/types/transaction';
import dayjs from 'dayjs';
import { notifySuccess } from '@/utils/notify';

// Removed Typography destructuring - using centralized components
// Replaced by CentralTextArea

/**
 * Transaction status configuration
 * Open/Closed Principle: Easy to extend with new statuses
 */
const STATUS_CONFIG = {
  SUCCESS: { color: 'success', icon: <CheckCircleOutlined />, text: 'Successful' },
  FAILED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' },
  PENDING: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' },
  REFUNDED: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Refunded' },
  CANCELLED: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' }
} as const;

/**
 * Transaction Detail Page Component
 * Implements Interface Segregation with specific detail view
 */
const TransactionDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();
  const transactionId = params.id as string;

  /**
   * Fetch transaction details
   * Dependency Inversion: Depends on service abstraction
   */
  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getById(transactionId);
      setTransaction(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch transaction details');
      router.push('/transactions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refund initiation
   * Single Responsibility: Only handles refund logic
   */
  const handleRefundInitiation = async () => {
    try {
      const values = await refundForm.validateFields();
      
      const refundRequest: IRefundRequest = {
        txn_id: transactionId,
        amount: values.amount,
        reason: values.reason
      };

      await transactionService.initiateRefund(refundRequest);
      notifySuccess('Refund initiated successfully');
      setRefundModalVisible(false);
      refundForm.resetFields();
      fetchTransactionDetails(); // Refresh data
    } catch (error: any) {
      message.error(error.message || 'Failed to initiate refund');
    }
  };

  /**
   * Build printable receipt HTML
   */
  const buildReceiptHtml = (t: ITransaction) => {
    const amount = (t.amount ?? t.paid_amount ?? 0) as number;
    const dateStr = t.trans_date ? dayjs(t.trans_date).format('DD MMM YYYY HH:mm:ss') : '-';
    const net = t.net_amount ?? amount;
    const fees = t.total_fees ?? 0;
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${t.txn_id}</title>
        <style>
          body { font-family: var(--font-inter), -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; color: var(--color-text-primary); }
          .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 700; }
          .meta { color: var(--color-text-secondary); font-size: 12px; }
          .section { border:1px solid var(--color-border-primary); border-radius:8px; padding:16px; margin: 12px 0; }
          .row { display:flex; justify-content: space-between; margin: 6px 0; }
          .label { color: var(--color-text-secondary); }
          .value { font-weight: 600; }
          .amount { font-size: 18px; font-weight: 700; }
          .muted { color: var(--color-text-tertiary); }
          @media print { .no-print { display:none } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Payment Receipt</div>
          <div class="meta">Generated at ${dayjs().format('DD MMM YYYY HH:mm:ss')}</div>
        </div>
        <div class="section">
          <div class="row"><span class="label">Transaction ID</span><span class="value">${t.txn_id}</span></div>
          <div class="row"><span class="label">Status</span><span class="value">${t.status ?? '—'}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
          <div class="row"><span class="label">Payment Mode</span><span class="value">${t.payment_mode ?? '—'}</span></div>
        </div>
        <div class="section">
          <div class="row"><span class="label">Client</span><span class="value">${t.client_name ?? '—'} (${t.client_code ?? '—'})</span></div>
          <div class="row"><span class="label">Customer</span><span class="value">${t.customer_name ?? '—'}</span></div>
          <div class="row"><span class="label">Email</span><span class="value">${t.payee_email ?? '—'}</span></div>
          <div class="row"><span class="label">Phone</span><span class="value">${t.payee_mob ?? '—'}</span></div>
        </div>
        <div class="section">
          <div class="row"><span class="label">Gateway</span><span class="value">${t.pg_name ?? '—'}</span></div>
          <div class="row"><span class="label">Bank</span><span class="value">${t.bank_name ?? '—'}</span></div>
        </div>
        <div class="section">
          <div class="row"><span class="label">Amount Paid</span><span class="amount">₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          <div class="row"><span class="label">Total Fees</span><span class="value">₹${Number(fees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          <div class="row"><span class="label">Net Amount</span><span class="value">₹${Number(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
        </div>
        <div class="muted">This is a system-generated receipt for your records.</div>
        <div class="no-print" style="margin-top:16px;">
          <button onclick="window.print()" style="padding:8px 12px;">Print</button>
        </div>
      </body>
    </html>`;
  };

  /**
   * Open printable receipt (user can Save as PDF)
   */
  const handleExportReceipt = () => {
    if (!transaction) return;
    const html = buildReceiptHtml(transaction);
    const w = window.open('', 'PRINT', 'height=700,width=900');
    if (!w) { message.error('Popup blocked. Please allow popups to download.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give the new document a moment to render before print
    w.onload = () => { try { w.print(); } catch (e) {} };
  };

  /**
   * Direct print action (same as export)
   */
  const handlePrintReceipt = () => {
    handleExportReceipt();
  };

  if (loading) {
    return (
      <CentralPageContainer>
        <div >
          <Spin size="large" tip="Loading transaction details..." />
        </div>
      </CentralPageContainer>
    );
  }

  if (!transaction) {
    return (
      <CentralPageContainer>
        <Alert
          message="Transaction Not Found"
          description="The requested transaction could not be found."
          type="error"
          showIcon
          action={
            <CentralButton onClick={() => router.push('/transactions/all')}>
              Back to Transactions
            </CentralButton>
          }
        />
      </CentralPageContainer>
    );
  }

  const statusConfig = STATUS_CONFIG[transaction.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  return (
    <CentralPageContainer
      title={`Transaction ${transaction.txn_id}`}
      subTitle={`${transaction.customer_name || 'Unknown Customer'} - ${transaction.formatted_amount}`}
      onBack={() => router.push('/transactions/all')}
      extra={[
        <CentralButton key="export" icon={<DownloadOutlined />} onClick={handleExportReceipt}>
          Export Receipt
        </CentralButton>,
        <CentralButton key="print" icon={<PrinterOutlined />} onClick={handlePrintReceipt}>
          Print
        </CentralButton>,
        transaction.is_refundable && (
          <CentralButton 
            key="refund" 
            type="primary" 
            danger 
            icon={<RollbackOutlined />}
            onClick={() => {
              setRefundModalVisible(true);
              refundForm.setFieldsValue({ amount: transaction.amount });
            }}
          >
            Initiate Refund
          </CentralButton>
        )
      ].filter(Boolean)}
      breadcrumb={{
        items: [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Transactions', href: '/transactions/all' },
          { title: 'All Transactions', href: '/transactions/all' },
          { title: transaction.txn_id }
        ]
      }}
    >
      <StyledSpace direction="vertical" size="large" >
        {/* Status Alert */}
        <Alert
          message={
            <StyledSpace>
              {statusConfig.icon}
              <CentralText strong>Transaction {statusConfig.text}</CentralText>
            </StyledSpace>
          }
          type={statusConfig.color as any}
          showIcon={false}
        />

        {/* Key Metrics */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Transaction Amount"
                value={transaction.amount}
                prefix="₹"
                precision={2}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Total Fees"
                value={transaction.total_fees || 0}
                prefix="₹"
                precision={2}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Net Settlement"
                value={transaction.net_amount || 0}
                prefix="₹"
                precision={2}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Settlement Status"
                value={transaction.is_settled ? 'Settled' : 'Pending'}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Transaction Details */}
        <StyledCard title="Transaction Information">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Transaction ID">{transaction.txn_id}</Descriptions.Item>
            <Descriptions.Item label="Client Transaction ID">{transaction.client_txn_id || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Gateway Transaction ID">{transaction.pg_txn_id || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Bank Transaction ID">{transaction.bank_txn_id || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Transaction Date">
              {transaction.trans_date ? dayjs(transaction.trans_date).format('DD MMM YYYY HH:mm:ss') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <CentralTag color={statusConfig.color as any}>{statusConfig.text}</CentralTag>
            </Descriptions.Item>
          </Descriptions>
        </StyledCard>

        {/* Payment Information */}
        <StyledCard title="Payment Information">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Payment Mode">{transaction.payment_mode || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Payment Gateway">{transaction.pg_name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Bank Name">{transaction.bank_name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Card Brand">{transaction.card_brand || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="VPA">{transaction.vpa || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Response Code">{transaction.pg_response_code || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </StyledCard>

        {/* Customer Information */}
        <StyledCard title="Customer Information">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer Name">{transaction.customer_name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{transaction.payee_email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Mobile">{transaction.payee_mob || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Registration Number">{transaction.reg_number || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Program ID">{transaction.program_id || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Client Code">{transaction.client_code || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </StyledCard>

        {/* Settlement Details */}
        {transaction.settlement_details && (
          <StyledCard title="Settlement Information">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Settlement Date">
                {transaction.settlement_details.settlement_date 
                  ? dayjs(transaction.settlement_details.settlement_date).format('DD MMM YYYY')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Net Amount">
                ₹{transaction.settlement_details.net_amount?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="Gross Amount">
                ₹{transaction.settlement_details.gross_amount?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="Fees">
                ₹{transaction.settlement_details.fees?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="GST">
                ₹{transaction.settlement_details.gst?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="Payout Status">
                <CentralTag color={transaction.settlement_details.payout_status ? 'success' : 'processing'}>
                  {transaction.settlement_details.payout_status ? 'Completed' : 'Pending'}
                </CentralTag>
              </Descriptions.Item>
            </Descriptions>
          </StyledCard>
        )}

        {/* Refund History */}
        {transaction.refund_details && transaction.refund_details.length > 0 && (
          <StyledCard title="Refund History">
            <Timeline>
              {transaction.refund_details.map((refund, index) => (
                <Timeline.Item 
                  key={index}
          color={refund.status === 'COMPLETED' ? 'success' : 'processing'}
                  dot={refund.status === 'COMPLETED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  <StyledSpace direction="vertical">
                    <CentralText strong>₹{refund.amount} - {refund.status}</CentralText>
                    <CentralText type="secondary">{refund.reason}</CentralText>
                    <CentralText type="secondary" >
                      {refund.request_date ? dayjs(refund.request_date).format('DD MMM YYYY HH:mm') : 'N/A'}
                    </CentralText>
                  </StyledSpace>
                </Timeline.Item>
              ))}
            </Timeline>
          </StyledCard>
        )}

        {/* Activity Timeline */}
        <StyledCard title="Transaction Timeline">
          <Timeline>
            <Timeline.Item color="green">
              Transaction Initiated
              <br />
              <CentralText type="secondary">
                {transaction.trans_date ? dayjs(transaction.trans_date).format('DD MMM YYYY HH:mm:ss') : 'N/A'}
              </CentralText>
            </Timeline.Item>
            {transaction.trans_complete_date && (
              <Timeline.Item color="green">
                Transaction Completed
                <br />
                <CentralText type="secondary">
                  {dayjs(transaction.trans_complete_date).format('DD MMM YYYY HH:mm:ss')}
                </CentralText>
              </Timeline.Item>
            )}
            {transaction.settlement_date && (
              <Timeline.Item color="blue">
                Settlement Processed
                <br />
                <CentralText type="secondary">
                  {dayjs(transaction.settlement_date).format('DD MMM YYYY HH:mm:ss')}
                </CentralText>
              </Timeline.Item>
            )}
            {transaction.refund_date && (
              <Timeline.Item color="red">
                Refund Initiated
                <br />
                <CentralText type="secondary">
                  {dayjs(transaction.refund_date).format('DD MMM YYYY HH:mm:ss')}
                </CentralText>
              </Timeline.Item>
            )}
          </Timeline>
        </StyledCard>
      </StyledSpace>

      {/* Refund Modal */}
      <Modal
        title="Initiate Refund"
        open={refundModalVisible}
        onOk={handleRefundInitiation}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
        }}
        okText="Initiate Refund"
        okButtonProps={{ danger: true }}
      >
        <Form
          form={refundForm}
          layout="vertical"
        >
          <Form.Item label="Transaction ID">
            <Input value={transaction.txn_id} disabled />
          </Form.Item>
          <Form.Item label="Original Amount">
            <Input value={`₹${transaction.amount?.toLocaleString('en-IN')}`} disabled />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Refund Amount"
            rules={[
              { required: true, message: 'Please enter refund amount' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
              {
                validator: (_, value) => {
                  if (value > (transaction.amount || 0)) {
                    return Promise.reject('Refund amount cannot exceed transaction amount');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              
              prefix="₹"
              precision={2}
              max={transaction.amount}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Refund Reason"
            rules={[
              { required: true, message: 'Please provide a reason for refund' },
              { min: 10, message: 'Reason must be at least 10 characters' }
            ]}
          >
            <CentralTextArea 
              rows={4} 
              placeholder="Enter detailed reason for refund..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
  );
};

export default TransactionDetailPage;
