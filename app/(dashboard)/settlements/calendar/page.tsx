/**
 * Settlement Calendar (Simplified List Grouped by Date)
 */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { StyledCard, CentralTitle, DatePicker, StyledSpace as Space, CentralButton as Button, CentralTable, App } from '@/components/ui';
import { settlementApiService, SettlementBatch } from '@/services/api/SettlementApiService';
import dayjs from 'dayjs';

export default function SettlementCalendarPage() {
  const { message } = App.useApp();
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await settlementApiService.getSettlementBatches({
        ...(dateRange[0] && dateRange[1] ? { batch_date_from: dateRange[0], batch_date_to: dateRange[1] } : {}),
        page: 1,
        page_size: 100,
      });
      setBatches(res.results || []);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load settlement batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const grouped = useMemo(() => {
    const map: Record<string, SettlementBatch[]> = {};
    batches.forEach(b => {
      const d = dayjs(b.batch_date).format('YYYY-MM-DD');
      map[d] = map[d] || [];
      map[d].push(b);
    });
    return Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [batches]);

  const columns = [
    { title: 'Batch ID', dataIndex: 'batch_id', key: 'batch_id' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Txns', dataIndex: 'total_transactions', key: 'total_transactions' },
    { title: 'Net Amount (₹)', dataIndex: 'net_settlement_amount', key: 'net_settlement_amount', render: (v: number) => (v || 0).toLocaleString('en-IN') },
  ];

  return (
    <StyledCard>
      <Space style={{ marginBottom: 12 }}>
        <CentralTitle level={3}>Settlement Calendar</CentralTitle>
      </Space>
      <Space style={{ marginBottom: 12 }}>
        <DatePicker.RangePicker onChange={(vals) => setDateRange([
          vals && vals[0] ? vals[0].toISOString() : undefined,
          vals && vals[1] ? vals[1].toISOString() : undefined,
        ])} />
        <Button onClick={fetchBatches}>Apply</Button>
        <Button onClick={() => { setDateRange([undefined, undefined]); fetchBatches(); }}>Clear</Button>
      </Space>
      {grouped.map(([date, list]) => (
        <StyledCard key={date} title={dayjs(date).format('DD MMM YYYY')} style={{ marginBottom: 12 }}>
          <CentralTable dataSource={list} columns={columns as any} rowKey={(r) => r.batch_id} pagination={false} />
        </StyledCard>
      ))}
    </StyledCard>
  );
}
