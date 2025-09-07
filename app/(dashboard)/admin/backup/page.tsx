'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, CentralButton as Button, Spin, App, CentralPageContainer, SmartLoader, Empty, StyledSpace, CentralTable } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import AdministrationApiService from '@/services/api/AdministrationApiService';

export default function AdminBackupPage() {
  const { message } = App.useApp();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Use global App message instance

  const load = async () => {
    setLoading(true);
    try {
      const list = await AdministrationApiService.listBackups();
      setBackups(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try {
      await AdministrationApiService.createBackup();
      message.success('Backup created');
      load();
    } catch (e: any) {
      message.error(e?.message || 'Backup failed');
    }
  };

  const headerExtra = (
    <StyledSpace>
      <Button onClick={load}>Refresh</Button>
      <Button type="primary" onClick={onCreate}>Create Backup</Button>
    </StyledSpace>
  );

  return (
    <CentralPageContainer withBackground title="Administration - Backup & Restore" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={24}>
              <StyledCard data-testid="stub-admin-backup">
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  {(!backups || backups.length === 0) ? (
                    <Empty description={<CentralText type="secondary">No backups found</CentralText>} />
                  ) : (
                    <CentralTable
                      dataSource={backups}
                      columns={[
                        { title: 'Name', dataIndex: 'name', key: 'name' },
                        { title: 'Size (KB)', dataIndex: 'size', key: 'size', render: (s: number) => Math.round((s || 0) / 1024) },
                        { title: 'Modified', dataIndex: 'modified', key: 'modified' },
                      ] as any}
                      rowKey={(b: any) => b.file}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      className="transaction-table"
                    />
                  )}
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
