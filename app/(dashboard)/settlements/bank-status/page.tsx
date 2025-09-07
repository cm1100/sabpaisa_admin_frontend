/**
 * Bank-wise Settlement Status
 */
'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralTable, DatePicker, StyledSpace as Space, CentralButton as Button, App } from '@/components/ui';
import { settlementApiService } from '@/services/api/SettlementApiService';
import dayjs from 'dayjs';

interface BankPerf {
  bank_code: string;
  bank_name: string;
  total_batches: number;
  completed: number;
  pending: number;
  failed: number;
  total_amount: number;
  success_rate: number;
  avg_processing_time: string;
  last_settlement?: string;
}

export default function BankWiseStatusPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<BankPerf[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await settlementApiService.getBankWisePerformance({
        ...(dateRange[0] && dateRange[1] ? { date_from: dateRange[0], date_to: dateRange[1] } : {}),
      });
      setData(res);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load bank-wise performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: 'Bank/PG', dataIndex: 'bank_name', key: 'bank_name' },
    { title: 'Total Batches', dataIndex: 'total_batches', key: 'total_batches' },
    { title: 'Completed', dataIndex: 'completed', key: 'completed' },
    { title: 'Pending', dataIndex: 'pending', key: 'pending' },
    { title: 'Failed', dataIndex: 'failed', key: 'failed' },
    { title: 'Total Amount (₹)', dataIndex: 'total_amount', key: 'total_amount', render: (v: number) => v.toLocaleString('en-IN') },
    { title: 'Success Rate (%)', dataIndex: 'success_rate', key: 'success_rate' },
    { title: 'Avg Processing', dataIndex: 'avg_processing_time', key: 'avg_processing_time' },
    { title: 'Last Settlement', dataIndex: 'last_settlement', key: 'last_settlement', render: (v?: string) => v ? dayjs(v).format('DD MMM YYYY HH:mm') : '—' },
  ];

  return (
    <StyledCard>
      <Space style={{ marginBottom: 12 }}>
        <CentralTitle level={3}>Bank-wise Status</CentralTitle>
      </Space>
      <Space style={{ marginBottom: 12 }}>
        <DatePicker.RangePicker showTime onChange={(vals) => setDateRange([
          vals && vals[0] ? vals[0].toISOString() : undefined,
          vals && vals[1] ? vals[1].toISOString() : undefined,
        ])} />
        <Button onClick={fetchData}>Apply</Button>
        <Button onClick={() => { setDateRange([undefined, undefined]); fetchData(); }}>Clear</Button>
      </Space>
      <CentralTable
        dataSource={data}
        columns={columns as any}
        rowKey={(r) => `${r.bank_code}`}
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="transaction-table"
      />
    </StyledCard>
  );
}
