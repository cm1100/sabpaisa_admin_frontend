'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, StyledStatistic as Statistic, Row, Col, List, CentralTag as Tag, Spin, CentralPageContainer, SmartLoader, CentralProTable, ProColumns, StyledSpace as Space, CentralButton as Button } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService, { ComplianceDashboard } from '@/services/api/ComplianceApiService';

export default function ComplianceDashboardPage() {
  const [data, setData] = useState<ComplianceDashboard | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ComplianceApiService.getDashboard();
        setData(((resp as any).data ?? resp) as ComplianceDashboard);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerExtra = (
    <Space>
      <Button onClick={() => window.location.reload()}>Refresh</Button>
    </Space>
  );

  const alertColumns: ProColumns<any>[] = [
    { title: 'Severity', dataIndex: 'severity', key: 'severity', width: 120, render: (_, r) => (<Tag color={r.severity === 'HIGH' ? 'red' : r.severity === 'MEDIUM' ? 'orange' : 'blue'}>{r.severity}</Tag>) },
    { title: 'Type', dataIndex: 'alert_type', key: 'alert_type', width: 160 },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Detected', dataIndex: 'detected_at', key: 'detected_at', width: 180 },
  ];

  return (
    <CentralPageContainer withBackground title="Compliance Dashboard" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid>
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={12} desktop={6} wide={6} ultraWide={6}>
              <StyledCard>
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 2, title: true }}>
                  <Statistic title="KYC Verified" value={data?.kyc_summary?.verified || 0} />
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol mobile={24} tablet={12} desktop={6} wide={6} ultraWide={6}>
              <StyledCard>
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 2, title: true }}>
                  <Statistic title="KYC Pending" value={data?.kyc_summary?.pending || 0} />
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol mobile={24} tablet={12} desktop={6} wide={6} ultraWide={6}>
              <StyledCard>
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 2, title: true }}>
                  <Statistic title="Compliance Score" value={`${data?.compliance_score || 0} / 100`} />
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol mobile={24} tablet={12} desktop={6} wide={6} ultraWide={6}>
              <StyledCard>
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 2, title: true }}>
                  <Statistic title="Pending Reviews" value={data?.pending_reviews || 0} />
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard title="Recent Alerts">
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  <CentralProTable<any>
                    rowKey={(r) => r.alert_id || `${r.alert_type}-${r.detected_at}`}
                    search={false}
                    dataSource={data?.recent_alerts || []}
                    columns={alertColumns}
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
