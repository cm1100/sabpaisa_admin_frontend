'use client';

import React, { useState, useEffect } from 'react';
import { StyledCard, CentralTable, CentralProgress, CentralBadge, CentralTitle, CentralText, Select, DatePicker, CentralButton, StyledSpace, Table } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSettlementStore } from '@/stores/settlementStore';
import { bankWiseApiService } from '@/services/api/BankWiseApiService';
import { themeConfig } from '@/styles/theme';
import dayjs from 'dayjs';

// Using centralized typography components
const { RangePicker } = DatePicker;

/**
 * Bank-wise Settlement Status Page
 * Shows settlement status across different banks
 */
const BankWiseSettlementPage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>([dayjs().subtract(7, 'days'), dayjs()]);
  const [bankData, setBankData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { batches, fetchBatches } = useSettlementStore();

  useEffect(() => {
    fetchBatches();
    fetchBankWiseData();
  }, []);
  
  const fetchBankWiseData = async () => {
    setIsLoading(true);
    try {
      const data = await bankWiseApiService.getBankWisePerformance({
        date_from: dateRange[0]?.format('YYYY-MM-DD'),
        date_to: dateRange[1]?.format('YYYY-MM-DD')
      });
      setBankData((data as any[]) || []);
    } catch (error) {
      console.error('Failed to fetch bank-wise data:', error);
      // Fallback to mock data if API fails
      setBankData(mockBankData);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback mock data in case API fails
  const mockBankData = [
    {
      bank_code: 'HDFC',
      bank_name: 'HDFC Bank',
      total_batches: 45,
      completed: 42,
      pending: 2,
      failed: 1,
      total_amount: 12500000,
      success_rate: 93.3,
      avg_processing_time: '2.5 hours',
      last_settlement: dayjs().subtract(2, 'hours').toISOString(),
    },
    {
      bank_code: 'ICICI',
      bank_name: 'ICICI Bank',
      total_batches: 38,
      completed: 36,
      pending: 2,
      failed: 0,
      total_amount: 9800000,
      success_rate: 94.7,
      avg_processing_time: '1.8 hours',
      last_settlement: dayjs().subtract(1, 'hour').toISOString(),
    },
    {
      bank_code: 'SBI',
      bank_name: 'State Bank of India',
      total_batches: 52,
      completed: 48,
      pending: 3,
      failed: 1,
      total_amount: 15200000,
      success_rate: 92.3,
      avg_processing_time: '3.2 hours',
      last_settlement: dayjs().subtract(4, 'hours').toISOString(),
    },
    {
      bank_code: 'AXIS',
      bank_name: 'Axis Bank',
      total_batches: 29,
      completed: 28,
      pending: 1,
      failed: 0,
      total_amount: 7100000,
      success_rate: 96.6,
      avg_processing_time: '2.1 hours',
      last_settlement: dayjs().subtract(30, 'minutes').toISOString(),
    },
  ];

  const columns = [
    {
      title: 'Bank',
      dataIndex: 'bank_name',
      key: 'bank_name',
      render: (text: string, record: any) => (
        <StyledSpace>
          <BankOutlined  />
          <div>
            <CentralText strong>{text}</CentralText>
            <br />
            <CentralText type="secondary">{record.bank_code}</CentralText>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Total Batches',
      dataIndex: 'total_batches',
      key: 'total_batches',
      align: 'center' as const,
      render: (count: number) => <CentralText strong>{count}</CentralText>,
    },
    {
      title: 'Status Distribution',
      key: 'status',
      render: (_: any, record: any) => (
        <StyledSpace direction="vertical">
          <div>
            <CentralBadge status="success" text={`Completed: ${record.completed}`} />
          </div>
          <div>
            <CentralBadge status="processing" text={`Pending: ${record.pending}`} />
          </div>
          {record.failed > 0 && (
            <div>
              <CentralBadge status="error" text={`Failed: ${record.failed}`} />
            </div>
          )}
        </StyledSpace>
      ),
    },
    {
      title: 'Success Rate',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: (rate: number) => (
        <div>
          <CentralProgress 
            percent={rate} 
            size="small" 
            status={rate >= 95 ? 'success' : rate >= 90 ? 'normal' : 'exception'}
            strokeColor={rate >= 95 ? themeConfig.token.colorSuccess : rate >= 90 ? themeConfig.token.colorInfo : themeConfig.token.colorError}
          />
          <CentralText>{rate}%</CentralText>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right' as const,
      render: (amount: number) => (
        <CentralText strong>₹{(amount / 100000).toFixed(1)}L</CentralText>
      ),
    },
    {
      title: 'Avg Processing Time',
      dataIndex: 'avg_processing_time',
      key: 'avg_processing_time',
      render: (time: string) => <CentralText type="secondary">{time}</CentralText>,
    },
    {
      title: 'Last Settlement',
      dataIndex: 'last_settlement',
      key: 'last_settlement',
      render: (date: string) => (
        <CentralText type="secondary" >
          {(() => {
            const diff = dayjs().diff(dayjs(date), 'minute');
            if (diff < 60) return `${diff} minutes ago`;
            const hours = Math.floor(diff / 60);
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            const days = Math.floor(hours / 24);
            return `${days} day${days > 1 ? 's' : ''} ago`;
          })()}
        </CentralText>
      ),
    },
  ];

  const totalStats = bankData.reduce((acc, bank) => ({
    total_batches: acc.total_batches + bank.total_batches,
    completed: acc.completed + bank.completed,
    pending: acc.pending + bank.pending,
    failed: acc.failed + bank.failed,
    total_amount: acc.total_amount + bank.total_amount,
  }), { total_batches: 0, completed: 0, pending: 0, failed: 0, total_amount: 0 });

  const overallSuccessRate = ((totalStats.completed / totalStats.total_batches) * 100).toFixed(1);

  return (
    <div >
      <ResponsiveRow justify="space-between" align="middle" >
        <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
          <CentralTitle level={2}>
            <BankOutlined /> Bank-wise Settlement Status
          </CentralTitle>
          <CentralText type="secondary">
            Monitor settlement performance across different banks
          </CentralText>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.formField} >
          <StyledSpace>
            <Select
              
              placeholder="Select Bank"
              value={selectedBank}
              onChange={setSelectedBank}
            >
              <Select.Option value="all">All Banks</Select.Option>
              {bankData.map(bank => (
                <Select.Option key={bank.bank_code} value={bank.bank_code}>
                  {bank.bank_name}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD MMM YYYY"
            />
<CentralButton type="primary" onClick={fetchBankWiseData} loading={isLoading}>
              Apply Filters
            </CentralButton>
          </StyledSpace>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Overall Statistics */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
          <StyledCard>
            <div >
              <div >
                <BankOutlined />
              </div>
              <div >
                {bankData.length}
              </div>
              <div >Active Banks</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
          <StyledCard>
            <div >
              <div >
                <CheckCircleOutlined />
              </div>
              <div >
                {totalStats.completed}
              </div>
              <div >Total Completed</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
          <StyledCard>
            <div >
              <div >
                <ClockCircleOutlined />
              </div>
              <div >
                {totalStats.pending}
              </div>
              <div >Total Pending</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
          <StyledCard>
            <div >
              <div >
                {overallSuccessRate}%
              </div>
              <div >
                Overall Success Rate
              </div>
              <CentralProgress 
                percent={Number(overallSuccessRate)} 
                size="small" 
                showInfo={false}
                strokeColor={themeConfig.token.colorSuccess}
              />
            </div>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Bank Performance Table */}
      <StyledCard title="Bank Performance Details">
        <CentralTable
          columns={columns}
          dataSource={bankData}
          rowKey="bank_code"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} banks`,
          }}
          scroll={{ x: 1200 }}
          className="transaction-table"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <CentralText strong>Total</CentralText>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <CentralText strong>{totalStats.total_batches}</CentralText>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <StyledSpace direction="vertical">
                    <CentralBadge status="success" text={`${totalStats.completed}`} />
                    <CentralBadge status="processing" text={`${totalStats.pending}`} />
                    <CentralBadge status="error" text={`${totalStats.failed}`} />
                  </StyledSpace>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <CentralText strong>{overallSuccessRate}%</CentralText>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <CentralText strong>₹{(totalStats.total_amount / 100000).toFixed(1)}L</CentralText>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={6}>-</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </StyledCard>
    </div>
  );
};

export default BankWiseSettlementPage;
