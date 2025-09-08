'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralProTable, ProColumns, Tag, Form, Select, Switch, CentralButton as Button, Spin, App, CentralPageContainer, SmartLoader, Empty, StyledSpace, Segmented } from '@/components/ui';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import dayjs from 'dayjs';
import AdministrationApiService, { AdminUserItem } from '@/services/api/AdministrationApiService';
import MobileDetailDrawer from '@/components/common/MobileDetailDrawer';
import { useResponsive } from '@/hooks/useResponsive';

export default function AdminUsersPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  // Use global App message instance
  const responsive = useResponsive();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));

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
    <ResponsiveHeaderActions
      primary={[{ key: 'refresh', label: 'Refresh', onClick: load }]}
    />
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
        <Select size="small" className="filter-md" value={u.role} options={roles} onChange={(v) => onUpdate(u, { role: v as any })} />
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
                  {responsive.isMobile && (
                    <StyledCard style={{ marginBottom: 8 }}>
                      <Segmented
                        options={[{ label: 'Cards', value: 'cards' }, { label: 'Table', value: 'table' }]}
                        value={viewMode}
                        onChange={(v:any)=>setViewMode(v)}
                        block
                      />
                    </StyledCard>
                  )}
                  {responsive.isMobile && viewMode === 'cards' ? (
                    users.length === 0 ? (
                      <Empty description="No users" />
                    ) : (
                      <StyledSpace direction="vertical" size="small" style={{ width: '100%' }}>
                        {users.map((u) => (
                          <StyledCard key={u.id} hoverable onClick={() => { setSelectedUser(u); setDetailOpen(true); }}>
                            <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                                <CentralText strong>{u.username}</CentralText>
                                <Tag color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Tag>
                              </StyledSpace>
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                                <CentralText type="secondary">{u.email || '—'}</CentralText>
                                <Tag>{u.role || '—'}</Tag>
                              </StyledSpace>
                              <StyledSpace style={{ justifyContent: 'space-between', width: '100%', fontSize: 12 }}>
                                <CentralText type="secondary">Last Login: {u.last_login ? dayjs(u.last_login as any).format('DD MMM YYYY HH:mm') : '-'}</CentralText>
                                <Button type="link" onClick={(e:any)=>{ e.stopPropagation(); setSelectedUser(u); setDetailOpen(true); }}>View</Button>
                              </StyledSpace>
                            </StyledSpace>
                          </StyledCard>
                        ))}
                      </StyledSpace>
                    )
                  ) : (
                  <CentralProTable<AdminUserItem>
                    id="admin:users"
                    rowKey="id"
                    search={false}
                    toolBarRender={() => [<Button key="refresh" onClick={load}>Refresh</Button>]}
                    columns={columns}
                    dataSource={users}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    className="transaction-table"
                    onRow={(record) => ({ onClick: () => { if (responsive.isMobile) { setSelectedUser(record); setDetailOpen(true); } } })}
                  />)}
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
      {responsive.isMobile && (
        <MobileDetailDrawer
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title={selectedUser ? selectedUser.username : 'User'}
        >
          {selectedUser && (
            <StyledSpace direction="vertical" style={{ width: '100%' }}>
              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                <CentralText type="secondary">Email</CentralText>
                <CentralText>{(selectedUser as any).email || '—'}</CentralText>
              </StyledSpace>
              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                <CentralText type="secondary">Active</CentralText>
                <Tag color={selectedUser.is_active ? 'green' : 'red'}>{selectedUser.is_active ? 'Active' : 'Inactive'}</Tag>
              </StyledSpace>
              <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                <CentralText type="secondary">Last Login</CentralText>
                <CentralText>{(selectedUser as any).last_login || '-'}</CentralText>
              </StyledSpace>
            </StyledSpace>
          )}
        </MobileDetailDrawer>
      )}
    </CentralPageContainer>
  );
}
