'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralProTable, ProColumns, Spin, CentralPageContainer, SmartLoader, CentralText, Empty, StyledSpace, CentralButton as Button } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import dayjs from 'dayjs';
import AdministrationApiService from '@/services/api/AdministrationApiService';

export default function AdminActivityPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await AdministrationApiService.listActivity();
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerExtra = (
    <StyledSpace>
      <Button onClick={() => window.location.reload()}>Refresh</Button>
      <a href="/admin/audits">Go to Audits</a>
    </StyledSpace>
  );

  const columns: ProColumns<any>[] = [
    { title: 'User', dataIndex: 'user_name', key: 'user_name', ellipsis: true },
    { title: 'Action', dataIndex: 'action', key: 'action', ellipsis: true },
    { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (_, r) => (r.timestamp ? dayjs(r.timestamp).format('DD MMM YYYY HH:mm') : '-') },
  ];

  return (
    <CentralPageContainer withBackground title="Administration - Activity Logs" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-admin-activity">
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  <CentralProTable<any>
                    rowKey={(r: any) => r.log_id || `${r.user_id}-${r.timestamp}`}
                    search={false}
                    toolBarRender={() => [<Button key="refresh" onClick={() => window.location.reload()}>Refresh</Button>, <a key="audits" href="/admin/audits">Go to Audits</a>]}
                    columns={columns}
                    dataSource={rows}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                  />
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
