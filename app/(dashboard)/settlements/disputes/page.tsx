/**
 * Settlement Dispute Resolution (List View)
 */
'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralTable, Tag, StyledSpace as Space, App } from '@/components/ui';
import { settlementApiService } from '@/services/api/SettlementApiService';
import dayjs from 'dayjs';

interface DisputeItem {
  id: string;
  dispute_id: string;
  batch_id: string;
  client_name: string;
  amount: number;
  status: string;
  priority: string;
  category: string;
  description: string;
  created_at: string;
  assigned_to?: string;
  resolution_deadline?: string;
}

export default function DisputesPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await settlementApiService.getDisputes();
      setData(res);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: 'Dispute ID', dataIndex: 'dispute_id', key: 'dispute_id' },
    { title: 'Batch ID', dataIndex: 'batch_id', key: 'batch_id' },
    { title: 'Client', dataIndex: 'client_name', key: 'client_name' },
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: (v: number) => v.toLocaleString('en-IN') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v==='OPEN'?'red': v==='IN_PROGRESS'?'blue':'green'}>{v}</Tag> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (v: string) => <Tag color={v==='HIGH'?'red': v==='MEDIUM'?'orange':'blue'}>{v}</Tag> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (v: string) => dayjs(v).format('DD MMM YYYY HH:mm') },
    { title: 'Assigned', dataIndex: 'assigned_to', key: 'assigned_to' },
    { title: 'Deadline', dataIndex: 'resolution_deadline', key: 'resolution_deadline', render: (v?: string) => v ? dayjs(v).format('DD MMM YYYY') : '—' },
  ];

  return (
    <StyledCard>
      <Space style={{ marginBottom: 12 }}>
        <CentralTitle level={3}>Dispute Resolution</CentralTitle>
      </Space>
      <CentralTable
        dataSource={data}
        columns={columns as any}
        rowKey={(r) => r.id}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </StyledCard>
  );
}
