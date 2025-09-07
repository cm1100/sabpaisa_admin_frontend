'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, Spin, CentralPageContainer, SmartLoader, Empty } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService, { AuditLog } from '@/services/api/ComplianceApiService';

export default function ComplianceAuditTrailPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ComplianceApiService.getAuditTrail();
        const data: any = ((resp as any).data?.results) ?? (resp as any).data ?? resp ?? [];
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CentralPageContainer withBackground title="Compliance Audit Trail">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
        <StyledCard title="Compliance Audit Trail" data-testid="stub-compliance-audit">
          <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
            {rows.length === 0 ? (
              <Empty description={<CentralText type="secondary">No audit logs</CentralText>} />
            ) : (
              <List
                size="small"
                dataSource={rows}
                renderItem={(item: any) => (
                  <List.Item>
                    <CentralText>
                      <Tag>{item.action}</Tag>
                      {item.user_name || 'System'} • {item.entity_type} #{item.entity_id} • {item.ip_address} • {new Date(item.timestamp).toLocaleString()}
                    </CentralText>
                  </List.Item>
                )}
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
