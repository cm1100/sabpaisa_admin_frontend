'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, Spin, CentralPageContainer, SmartLoader, Empty, CentralTable, StyledSpace, CentralButton as Button } from '@/components/ui';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import AdministrationApiService from '@/services/api/AdministrationApiService';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r, u] = await Promise.all([
          AdministrationApiService.listRoles(),
          AdministrationApiService.listUsers(),
        ]);
        setRoles(r.roles);
        setUsers(u);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countByRole = (role: string) => users.filter(u => u.role === role).length;

  const headerExtra = (
    <ResponsiveHeaderActions
      primary={[{ key: 'refresh', label: 'Refresh', onClick: () => window.location.reload() }]}
    />
  );

  const data = roles || [];
  const columns = [
    { title: 'Role', dataIndex: 'value', key: 'value', render: (v: string) => <Tag style={{ marginRight: 8 }}>{v}</Tag> },
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'Users', key: 'count', render: (_: any, r: any) => countByRole(r.value) },
  ];

  return (
    <CentralPageContainer withBackground title="Administration - Roles & Permissions" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-admin-roles">
                <CentralTitle level={5}>Roles</CentralTitle>
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  {(!roles || roles.length === 0) ? (
                    <Empty description={<CentralText type="secondary">No roles</CentralText>} />
                  ) : (
                    <CentralTable
                      id="admin:roles"
                      dataSource={data}
                      columns={columns as any}
                      rowKey={(r: any) => r.value}
                      pagination={false}
                      className="transaction-table"
                    />
                  )}
                </SmartLoader>
                <CentralTitle level={5} style={{ marginTop: 16 }}>Notes</CentralTitle>
                <CentralText>
                  Roles map to system capabilities. Update per-user role in Users page.
                </CentralText>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
