/**
 * Failed Transactions Page
 * Shows all transactions with FAILED status for investigation and resolution
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {  
  StyledCard, 
  CentralTable, 
  CentralTag, 
  StyledSpace, 
  CentralButton, 
  CentralTitle,
  CentralText,
  StyledStatistic, 
  CentralAlert,
  Modal,
  Descriptions,
  Timeline,
  message,
  Tooltip,
  CentralBadge
 } from '@/components/ui';
import { notifyInfo } from '@/utils/notify';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { 
  CloseCircleOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RedoOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { transactionService } from '@/services/api/transactionService';
import type { ITransaction } from '@/types/transaction';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Using centralized typography components

const FailedTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    todayFailed: 0,
    weekFailed: 0,
    monthFailed: 0,
    totalAmount: 0,
    byReason: {} as Record<string, number>,
    byPaymentMode: {} as Record<string, number>
  });

  const fetchFailedTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getAll({
        status: 'FAILED',
        page: 1,
        page_size: 100,
        date_from: dayjs().subtract(30, 'days').toISOString(),
        date_to: dayjs().toISOString()
      });

      const failedTxns = response.results || [];
      setTransactions(failedTxns);

      // Calculate statistics
      const today = dayjs().startOf('day');
      const weekAgo = dayjs().subtract(7, 'days').startOf('day');
      const monthAgo = dayjs().subtract(30, 'days').startOf('day');

      const todayFailed = failedTxns.filter((t: ITransaction) => 
        dayjs(t.trans_date).isAfter(today)
      ).length;

      const weekFailed = failedTxns.filter((t: ITransaction) => 
        dayjs(t.trans_date).isAfter(weekAgo)
      ).length;

      const monthFailed = failedTxns.length;

      const totalAmount = failedTxns.reduce((sum: number, t: ITransaction) => 
        sum + (Number(t.amount) || 0), 0
      );

      // Group by failure reason
      const byReason: Record<string, number> = {};
      const byPaymentMode: Record<string, number> = {};

      failedTxns.forEach((t: ITransaction) => {
        const reason = t.bank_message || t.pg_message || 'Unknown';
        byReason[reason] = (byReason[reason] || 0) + 1;
        
        const mode = t.payment_mode || 'Unknown';
        byPaymentMode[mode] = (byPaymentMode[mode] || 0) + 1;
      });

      setStats({
        total: monthFailed,
        todayFailed,
        weekFailed,
        monthFailed,
        totalAmount,
        byReason,
        byPaymentMode
      });
    } catch (error: any) {
      console.error('Failed to fetch failed transactions:', error);
      message.error(error?.message || 'Failed to load failed transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailedTransactions();
  }, []);

  const getFailureReason = (transaction: ITransaction) => {
    return transaction.bank_message || 
           transaction.pg_message || 
           transaction.status_message || 
           'Unknown Error';
  };

  const getFailureType = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('insufficient') || lowerReason.includes('balance')) {
      return { color: 'warning', icon: <ExclamationCircleOutlined />, type: 'Insufficient Funds' };
    }
    if (lowerReason.includes('timeout') || lowerReason.includes('time')) {
      return { color: 'processing', icon: <ClockCircleOutlined />, type: 'Timeout' };
    }
    if (lowerReason.includes('declined') || lowerReason.includes('reject')) {
      return { color: 'error', icon: <CloseCircleOutlined />, type: 'Declined' };
    }
    if (lowerReason.includes('cancel')) {
      return { color: 'default', icon: <InfoCircleOutlined />, type: 'Cancelled' };
    }
    return { color: 'default', icon: <WarningOutlined />, type: 'Other' };
  };

  const handleRetry = async (transaction: ITransaction) => {
    Modal.confirm({
      title: 'Retry Transaction',
      content: `Are you sure you want to retry transaction ${transaction.txn_id}?`,
      onOk: async () => {
        try {
          // In production, this would trigger a retry mechanism
          notifyInfo('Retry functionality would be implemented here');
        } catch (error: any) {
          message.error(error?.message || 'Failed to retry transaction');
        }
      }
    });
  };

  const viewDetails = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const columns: ColumnsType<ITransaction> = [
    {
      title: 'Transaction ID',
      dataIndex: 'txn_id',
      key: 'txn_id',
      width: 180,
      fixed: 'left',
      render: (id: string) => (
        <CentralText copyable >
          {id}
        </CentralText>
      )
    },
    {
      title: 'Failed At',
      dataIndex: 'trans_date',
      key: 'trans_date',
      width: 180,
      sorter: (a: ITransaction, b: ITransaction) => 
        new Date(a.trans_date).getTime() - new Date(b.trans_date).getTime(),
      render: (date: string) => (
        <StyledSpace direction="vertical" size={0}>
          <CentralText>{dayjs(date).format('DD MMM YYYY')}</CentralText>
          <CentralText type="secondary" >
            {dayjs(date).format('HH:mm:ss')} ({dayjs(date).fromNow()})
          </CentralText>
        </StyledSpace>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      sorter: (a: ITransaction, b: ITransaction) => 
        (Number(a.amount) || 0) - (Number(b.amount) || 0),
      render: (amount: number) => (
        <CentralText strong >
          ₹{Number(amount || 0).toLocaleString('en-IN')}
        </CentralText>
      )
    },
    {
      title: 'Failure Reason',
      key: 'reason',
      width: 250,
      render: (_: any, record: ITransaction) => {
        const reason = getFailureReason(record);
        const failureType = getFailureType(reason);
        return (
          <StyledSpace direction="vertical" size={0}>
            <CentralBadge 
              status={failureType.color as any}
              text={
                <StyledSpace>
                  {failureType.icon}
                  <CentralText strong>{failureType.type}</CentralText>
                </StyledSpace>
              }
            />
            <CentralText type="secondary" >
              {reason}
            </CentralText>
          </StyledSpace>
        );
      }
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      width: 120,
      filters: [
        { text: 'UPI', value: 'UPI' },
        { text: 'CARD', value: 'CARD' },
        { text: 'NET_BANKING', value: 'NET_BANKING' },
        { text: 'WALLET', value: 'WALLET' }
      ],
      onFilter: (value: any, record: ITransaction) => record.payment_mode === value,
      render: (mode: string) => <CentralTag>{mode || 'N/A'}</CentralTag>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      ellipsis: true,
      render: (name: string, record: ITransaction) => (
        <StyledSpace direction="vertical" size={0}>
          <CentralText>{name || 'N/A'}</CentralText>
          <CentralText type="secondary" >
            {record.customer_mobile || record.customer_email || 'No contact'}
          </CentralText>
        </StyledSpace>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: ITransaction) => (
        <StyledSpace>
          <Tooltip title="Retry Transaction">
            <CentralButton
              size="small"
              icon={<RedoOutlined />}
              onClick={() => handleRetry(record)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <CentralButton
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => viewDetails(record)}
            />
          </Tooltip>
        </StyledSpace>
      )
    }
  ];

  // Get top failure reasons
  const topFailureReasons = Object.entries(stats.byReason)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <ResponsiveContainer maxWidth="full" padding background="none" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <StyledCard>
          <StyledSpace direction="vertical" size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <CentralTitle level={2}>Failed Transactions</CentralTitle>
                <CentralText type="secondary">Monitor and investigate failed payment attempts</CentralText>
              </div>
              <CentralButton
                icon={<ReloadOutlined />}
                onClick={fetchFailedTransactions}
                loading={loading}
              >
                Refresh
              </CentralButton>
            </div>
        {/* Alert if high failure rate */}
        {stats.todayFailed > 10 && (
          <CentralAlert
            message="High Failure Rate Detected"
            description={`${stats.todayFailed} transactions have failed today. Consider investigating common failure patterns.`}
            type="warning"
            showIcon
            closable
          />
        )}

        {/* Statistics Cards */}
        <ResponsiveRow gutter={16}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Failed Today"
                value={stats.todayFailed}
                prefix={<CloseCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Failed This Week"
                value={stats.weekFailed}
                prefix={<WarningOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Failed This Month"
                value={stats.monthFailed}
                prefix={<ExclamationCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Total Amount"
                value={stats.totalAmount}
                precision={2}
                prefix="₹"
                formatter={(value) => `${Number(value).toLocaleString('en-IN')}`}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Top Failure Reasons */}
        {topFailureReasons.length > 0 && (
          <StyledCard 
            title="Top Failure Reasons" 
                        extra={<CentralText type="secondary">Last 30 days</CentralText>}
          >
            <StyledSpace direction="vertical" >
              {topFailureReasons.map(([reason, count]) => {
                const failureType = getFailureType(reason);
                return (
                  <div key={reason} >
                    <StyledSpace>
                      {failureType.icon}
                      <CentralText>{reason.substring(0, 50)}{reason.length > 50 ? '...' : ''}</CentralText>
                    </StyledSpace>
                    <CentralBadge count={count}  />
                  </div>
                );
              })}
            </StyledSpace>
          </StyledCard>
        )}

        {/* Failed Transactions Table */}
        <StyledCard >
          <CentralTable
            id="transactions:main"
            columns={columns}
            dataSource={transactions}
            rowKey="txn_id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number) => `Total ${total} failed transactions`
            }}
            scroll={{ x: 1300 }}
            rowClassName="failed-row"
          />
        </StyledCard>
          </StyledSpace>
        </StyledCard>

        {/* Transaction Details Modal */}
      <Modal
        title={`Failed Transaction Details - ${selectedTransaction?.txn_id}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <CentralButton key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </CentralButton>,
          <CentralButton
            key="retry"
            type="primary"
            icon={<RedoOutlined />}
            onClick={() => selectedTransaction && handleRetry(selectedTransaction)}
          >
            Retry Transaction
          </CentralButton>
        ]}
        width={700}
      >
        {selectedTransaction && (
          <StyledSpace direction="vertical"  size="large">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Transaction ID" span={2}>
                <CentralText copyable>{selectedTransaction.txn_id}</CentralText>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                ₹{Number(selectedTransaction.amount || 0).toLocaleString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Mode">
                {selectedTransaction.payment_mode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Failed At" span={2}>
                {dayjs(selectedTransaction.trans_date).format('DD MMM YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Failure Reason" span={2}>
                <CentralText type="danger">{getFailureReason(selectedTransaction)}</CentralText>
              </Descriptions.Item>
              <Descriptions.Item label="Bank Response" span={2}>
                {selectedTransaction.bank_message || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Gateway Response" span={2}>
                {selectedTransaction.pg_message || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <StyledCard title="Customer Information" size="small">
              <Descriptions column={2}>
                <Descriptions.Item label="Name">
                  {selectedTransaction.customer_name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  {selectedTransaction.customer_mobile || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  {selectedTransaction.customer_email || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </StyledCard>

            <StyledCard title="Transaction Timeline" size="small">
              <Timeline>
                <Timeline.Item color="blue">
                  Transaction Initiated
                  <br />
                  <CentralText type="secondary">
                    {dayjs(selectedTransaction.trans_date).format('DD MMM YYYY HH:mm:ss')}
                  </CentralText>
                </Timeline.Item>
                <Timeline.Item color="red">
                  Transaction Failed
                  <br />
                  <CentralText type="secondary">
                    Reason: {getFailureReason(selectedTransaction)}
                  </CentralText>
                </Timeline.Item>
              </Timeline>
            </StyledCard>
          </StyledSpace>
        )}
        </Modal>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default FailedTransactionsPage;
