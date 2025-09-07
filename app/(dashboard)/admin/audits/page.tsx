'use client';

import React, { useMemo, useRef, useState } from 'react';
import { CentralPageContainer, StyledCard, StyledSpace, CentralTitle, CentralText, CentralButton as Button, CentralProTable, ProColumns, DatePicker, Select, Input, Modal, App, Tabs } from '@/components/ui';
import AuditsApiService, { ApiKeyHistoryItem, NotificationLogItem, TransactionMetadataItem } from '@/services/api/AuditsApiService';

const { RangePicker } = DatePicker;

const JsonPreview: React.FC<{ value: any }> = ({ value }) => {
  let text = '';
  try { text = JSON.stringify(value, null, 2); } catch { text = String(value); }
  return <pre style={{ maxHeight: 360, overflow: 'auto', background: 'var(--color-fill-tertiary)', padding: 12, borderRadius: 6 }}>{text}</pre>;
};

const ExportButton: React.FC<{ filename: string; onExport: () => Promise<any[]> }> = ({ filename, onExport }) => {
  const { message } = App.useApp();
  const onClick = async () => {
    try {
      const data = await onExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    } catch (e:any) {
      message.error(e?.message || 'Export failed');
    }
  };
  return <Button onClick={onClick}>Export JSON</Button>;
};

const AuditsPage: React.FC = () => {
  const { message } = App.useApp();
  const [activeKey, setActiveKey] = useState('keys');
  const keysRef = useRef<any>(null);
  const logsRef = useRef<any>(null);
  const metaRef = useRef<any>(null);
  const lastKeyParams = useRef<any>({});
  const lastLogParams = useRef<any>({});
  const lastMetaParams = useRef<any>({});

  // API Key History
  const keyColumns: ProColumns<ApiKeyHistoryItem>[] = [
    { title: 'API User', dataIndex: 'api_user', key: 'api_user', copyable: true },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    { title: 'Changed By', dataIndex: 'changed_by', key: 'changed_by' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
  ];

  // Notification Logs
  const logColumns: ProColumns<NotificationLogItem>[] = [
    { title: 'Channel', dataIndex: 'channel', key: 'channel' },
    { title: 'Recipient', dataIndex: 'recipient', key: 'recipient' },
    { title: 'Template', dataIndex: 'template', key: 'template' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Code', dataIndex: 'response_code', key: 'response_code' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Payload',
      key: 'payload',
      render: (_, r) => <Button size="small" onClick={() => Modal.info({ title: 'Payload', width: 720, content: <JsonPreview value={r.payload} /> })}>View</Button>
    }
  ];

  // Transaction Metadata
  const metaColumns: ProColumns<TransactionMetadataItem>[] = [
    { title: 'Txn ID', dataIndex: 'txn_id', key: 'txn_id', copyable: true },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Value',
      key: 'value',
      render: (_, r) => <Button size="small" onClick={() => Modal.info({ title: `${r.txn_id} • ${r.key}`, width: 720, content: <JsonPreview value={r.value} /> })}>View</Button>
    }
  ];

  return (
    <CentralPageContainer title="Audits & Logs" subTitle="Security events, notifications, and transaction metadata">
      <StyledCard>
        <Tabs
          activeKey={activeKey}
          onChange={(k)=>setActiveKey(k)}
          items={[
            {
              key: 'keys',
              label: 'API Key History',
              children: (
                <CentralProTable<ApiKeyHistoryItem>
                  id="api-key-history"
                  columns={keyColumns}
                  actionRef={keysRef}
                  request={async (params) => {
                    try {
                      const q: any = {};
                      if (params.api_user) q.api_user = params.api_user;
                      if (params.action) q.action = params.action;
                      if (params.dateRange?.length === 2) { q.created_at__gte = params.dateRange[0]; q.created_at__lte = params.dateRange[1]; }
                      lastKeyParams.current = q;
                      const data = await AuditsApiService.listApiKeyHistory(q);
                      return { data, success: true, total: data.length };
                    } catch (e:any) { message.error(e?.message || 'Load failed'); return { data: [], success: false, total: 0 }; }
                  }}
                  toolBarRender={() => [
                    <ExportButton key="export" filename="api_key_history.json" onExport={async ()=> AuditsApiService.listApiKeyHistory(lastKeyParams.current)} />
                  ]}
                  search={{
                    labelWidth: 'auto',
                    optionRender: (search, _props, dom) => dom?.reverse(),
                    collapsed: false,
                    defaultCollapsed: false
                  }}
                  form={{
                    syncToUrl: false,
                    ignoreRules: false
                  }}
                />
              )
            },
            {
              key: 'logs',
              label: 'Notification Logs',
              children: (
                <CentralProTable<NotificationLogItem>
                  id="notification-logs"
                  columns={logColumns}
                  actionRef={logsRef}
                  request={async (params) => {
                    try {
                      const q: any = {};
                      if (params.channel) q.channel = params.channel;
                      if (params.status) q.status = params.status;
                      if (params.recipient) q.recipient = params.recipient;
                      if (params.dateRange?.length === 2) { q.created_at__gte = params.dateRange[0]; q.created_at__lte = params.dateRange[1]; }
                      lastLogParams.current = q;
                      const data = await AuditsApiService.listNotificationLogs(q);
                      return { data, success: true, total: data.length };
                    } catch (e:any) { message.error(e?.message || 'Load failed'); return { data: [], success: false, total: 0 }; }
                  }}
                  toolBarRender={() => [
                    <ExportButton key="export" filename="notification_logs.json" onExport={async ()=> AuditsApiService.listNotificationLogs(lastLogParams.current)} />
                  ]}
                />
              )
            },
            {
              key: 'meta',
              label: 'Transaction Metadata',
              children: (
                <CentralProTable<TransactionMetadataItem>
                  id="transaction-metadata"
                  columns={metaColumns}
                  actionRef={metaRef}
                  request={async (params) => {
                    try {
                      const q: any = {};
                      if (params.txn_id) q.txn_id = params.txn_id;
                      if (params.key) q.key = params.key;
                      if (params.dateRange?.length === 2) { q.created_at__gte = params.dateRange[0]; q.created_at__lte = params.dateRange[1]; }
                      lastMetaParams.current = q;
                      const data = await AuditsApiService.listTransactionMetadata(q);
                      return { data, success: true, total: data.length };
                    } catch (e:any) { message.error(e?.message || 'Load failed'); return { data: [], success: false, total: 0 }; }
                  }}
                  toolBarRender={() => [
                    <ExportButton key="export" filename="transaction_metadata.json" onExport={async ()=> AuditsApiService.listTransactionMetadata(lastMetaParams.current)} />
                  ]}
                />
              )
            }
          ]}
        />
      </StyledCard>
    </CentralPageContainer>
  );
};

export default AuditsPage;
