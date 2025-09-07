'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralProTable, ProColumns, Tag, Form, Select, Switch, CentralButton as Button, Spin, App, CentralPageContainer, SmartLoader, Empty, StyledSpace } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import dayjs from 'dayjs';
import AdministrationApiService, { AdminUserItem } from '@/services/api/AdministrationApiService';

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  // Use global App message instance

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        AdministrationApiService.listUsers(),
        AdministrationApiService.listRoles(),
      ]);
      setUsers(u);
      setRoles(r.roles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpdate = async (user: AdminUserItem, changes: Partial<AdminUserItem>) => {
    try {
      const updated = await AdministrationApiService.updateUser(user.id, changes);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updated } : u));
      message.success('User updated');
    } catch (e: any) {
      message.error(e?.message || 'Update failed');
    }
  };

  const headerExtra = (
    <StyledSpace>
      <Button onClick={load}>Refresh</Button>
    </StyledSpace>
  );

  const columns: ProColumns<AdminUserItem>[] = [
    { title: 'Username', dataIndex: 'username', key: 'username', ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      valueType: 'select',
      fieldProps: { options: roles },
      render: (_, u) => (
        <Select size="small" style={{ width: 180 }} value={u.role} options={roles} onChange={(v) => onUpdate(u, { role: v as any })} />
      )
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      valueType: 'switch',
      render: (checked, u) => (<Switch checked={!!checked} onChange={(v) => onUpdate(u as AdminUserItem, { is_active: v })} />),
      width: 120,
    },
    { title: 'Last Login', dataIndex: 'last_login', key: 'last_login', render: (ts) => (ts ? dayjs(ts as string).format('DD MMM YYYY HH:mm') : '-'), width: 180 },
    { title: 'Last Activity', dataIndex: 'last_activity', key: 'last_activity', render: (ts) => (ts ? dayjs(ts as string).format('DD MMM YYYY HH:mm') : '-'), width: 180 },
  ];

  return (
    <CentralPageContainer withBackground title="Administration - Users" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-admin-users">
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  <CentralProTable<AdminUserItem>
                    rowKey="id"
                    search={false}
                    toolBarRender={() => [<Button key="refresh" onClick={load}>Refresh</Button>]}
                    columns={columns}
                    dataSource={users}
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
