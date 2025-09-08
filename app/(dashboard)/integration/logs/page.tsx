'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Tabs, CentralProTable, ProColumns, Spin, CentralPageContainer, Segmented, StyledSpace, Empty } from '@/components/ui';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));

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
                <>
                <StyledSpace style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                  <CentralTitle level={4} style={{ margin: 0 }}>Logs</CentralTitle>
                  <Segmented options={[{ label: 'Cards', value: 'cards' }, { label: 'Table', value: 'table' }]} value={viewMode} onChange={(v:any)=>setViewMode(v)} />
                </StyledSpace>
                {viewMode === 'cards' ? (
                  <StyledSpace direction="vertical" size="small" style={{ width: '100%' }}>
                    <StyledCard title="Gateway Sync Logs">
                      {syncLogs.length === 0 ? <Empty description="No logs" /> : (
                        <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                          {syncLogs.map((r:any, i:number) => (
                            <StyledCard key={i} size="small">
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                                <CentralText strong>{r.operation || r.name || 'Operation'}</CentralText>
                                <CentralText type="secondary">{r.created_at ? dayjs(r.created_at).format('DD MMM HH:mm') : '-'}</CentralText>
                              </StyledSpace>
                              <CentralText type="secondary">Resp: {r.response_status ?? '-'}</CentralText>
                            </StyledCard>
                          ))}
                        </StyledSpace>
                      )}
                    </StyledCard>
                    <StyledCard title="Webhook Logs">
                      {webhookLogs.length === 0 ? <Empty description="No logs" /> : (
                        <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                          {webhookLogs.map((r:any, i:number) => (
                            <StyledCard key={i} size="small">
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                                <CentralText strong>{r.event || 'Event'}</CentralText>
                                <CentralText type="secondary">{r.timestamp ? dayjs(r.timestamp).format('DD MMM HH:mm') : '-'}</CentralText>
                              </StyledSpace>
                              <CentralText type="secondary">Status: {r.status} • Code: {r.statusCode}</CentralText>
                            </StyledCard>
                          ))}
                        </StyledSpace>
                      )}
                    </StyledCard>
                    <StyledCard title="API Logs">
                      {apiLogs.length === 0 ? <Empty description="No logs" /> : (
                        <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                          {apiLogs.map((r:any, i:number) => (
                            <StyledCard key={i} size="small">
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                                <CentralText strong>{r.method} {r.url}</CentralText>
                                <CentralText type="secondary">{r.called_at ? dayjs(r.called_at).format('DD MMM HH:mm') : '-'}</CentralText>
                              </StyledSpace>
                              <CentralText type="secondary">Status: {r.response_status} • Time: {r.response_time_ms} ms</CentralText>
                            </StyledCard>
                          ))}
                        </StyledSpace>
                      )}
                    </StyledCard>
                  </StyledSpace>
                ) : (
                <Tabs
                  items={[
                    {
                      key: 'sync',
                      label: 'Gateway Sync Logs',
                      children: (
                  <CentralProTable<any> rowKey="log_id" search={false} columns={syncColumns} dataSource={syncLogs} pagination={{ pageSize: 10, showSizeChanger: false }} className="transaction-table" />
                )
                    },
                    {
                      key: 'webhooks',
                      label: 'Webhook Logs',
                      children: (
                  <CentralProTable<any> rowKey={(r: any) => r.id || `${r.webhookId}-${r.timestamp}`} search={false} columns={webhookColumns} dataSource={webhookLogs} pagination={{ pageSize: 10, showSizeChanger: false }} className="transaction-table" />
                )
                    },
                    {
                      key: 'api-logs',
                      label: 'API Logs',
                      children: (
                  <CentralProTable<any> rowKey={(r: any) => r.id || `${r.method}-${r.url}-${r.called_at}`} search={false} columns={apiLogColumns} dataSource={apiLogs} pagination={{ pageSize: 10, showSizeChanger: false }} className="transaction-table" />
                )
                    }
                  ]}
                />
                )}
                </>
              )}
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
