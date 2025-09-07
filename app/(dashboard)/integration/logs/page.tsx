'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Tabs, CentralProTable, ProColumns, Spin, CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import dayjs from 'dayjs';
import GatewaySyncApiService from '@/services/api/GatewaySyncApiService';
import WebhookApiService from '@/services/api/WebhookApiService';
import IntegrationApiService from '@/services/api/IntegrationApiService';

export default function IntegrationLogsPage() {
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sync, webhooks, apiLogs] = await Promise.all([
          GatewaySyncApiService.getSyncLogs({ page: 1, page_size: 50 }),
          WebhookApiService.getWebhookLogs({ page: 1, page_size: 50 }),
          IntegrationApiService.getApiLogs().catch((): any[] => [])
        ]);
        setSyncLogs((sync.data as any).results || sync.data || []);
        setWebhookLogs((webhooks.data as any).results || webhooks.data || []);
        setApiLogs(apiLogs as any);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const syncColumns: ProColumns<any>[] = [
    { title: 'Operation', dataIndex: 'operation', key: 'operation' },
    { title: 'Status', dataIndex: 'success', key: 'success', render: (_, r) => (r.success ? 'SUCCESS' : 'FAIL') },
    { title: 'Response', dataIndex: 'response_status', key: 'response_status' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (_, r) => (r.created_at ? dayjs(r.created_at).format('DD MMM YYYY HH:mm') : '-') },
  ];

  const webhookColumns: ProColumns<any>[] = [
    { title: 'Event', dataIndex: 'event', key: 'event' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Code', dataIndex: 'statusCode', key: 'statusCode' },
    { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (_, r) => (r.timestamp ? dayjs(r.timestamp).format('DD MMM YYYY HH:mm') : '-') },
  ];

  const apiLogColumns: ProColumns<any>[] = [
    { title: 'Method', dataIndex: 'method', key: 'method' },
    { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
    { title: 'Status', dataIndex: 'response_status', key: 'response_status' },
    { title: 'Time (ms)', dataIndex: 'response_time_ms', key: 'response_time_ms' },
    { title: 'When', dataIndex: 'called_at', key: 'called_at', render: (_, r) => (r.called_at ? dayjs(r.called_at).format('DD MMM YYYY HH:mm') : '-') },
  ];

  return (
    <CentralPageContainer withBackground title="Integration Logs">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-integration-logs">
              {loading ? <Spin /> : (
                <Tabs
                  items={[
                    {
                      key: 'sync',
                      label: 'Gateway Sync Logs',
                      children: (
                    <CentralProTable<any> rowKey="log_id" search={false} columns={syncColumns} dataSource={syncLogs} pagination={{ pageSize: 10, showSizeChanger: false }} />
                  )
                    },
                    {
                      key: 'webhooks',
                      label: 'Webhook Logs',
                      children: (
                    <CentralProTable<any> rowKey={(r: any) => r.id || `${r.webhookId}-${r.timestamp}`} search={false} columns={webhookColumns} dataSource={webhookLogs} pagination={{ pageSize: 10, showSizeChanger: false }} />
                  )
                    },
                    {
                      key: 'api-logs',
                      label: 'API Logs',
                      children: (
                    <CentralProTable<any> rowKey={(r: any) => r.id || `${r.method}-${r.url}-${r.called_at}`} search={false} columns={apiLogColumns} dataSource={apiLogs} pagination={{ pageSize: 10, showSizeChanger: false }} />
                  )
                    }
                  ]}
                />
              )}
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
