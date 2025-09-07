'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Tag, Spin, CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService from '@/services/api/ComplianceApiService';

export default function ComplianceRiskAssessmentPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ComplianceApiService.getRiskMetrics();
        setMetrics(resp.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CentralPageContainer withBackground title="Compliance Risk Heat Map">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard title="Compliance Risk Heat Map" data-testid="stub-compliance-risk">
          {loading && <Spin />}
          {metrics && (
            <div>
              <CentralTitle level={5}>Risk by Client Category</CentralTitle>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {Object.entries(metrics.by_category || {}).map(([k, v]) => (
                  <Tag key={k}>{k}: {v as any}</Tag>
                ))}
              </div>

              <CentralTitle level={5}>Weekly Heat Map (last 14 days)</CentralTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2, marginBottom: 16 }}>
                {(metrics.heat_map || []).flatMap((row: number[], d: number) =>
                  row.map((val: number, h: number) => (
                    <div key={`${d}-${h}`} title={`D${d} H${h}: ${val}`}
                      style={{
                        height: 14,
                        background:
                          val > 20 ? 'var(--app-colorError)' :
                          val > 10 ? 'var(--app-colorWarning)' :
                          val > 5 ? 'var(--app-colorWarning)' :
                          val > 0 ? 'var(--app-colorSuccess)' : 'var(--app-colorBgLayout)',
                      }}
                    />
                  ))
                )}
              </div>

              <CentralTitle level={5}>Average Risk by Payment Mode</CentralTitle>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(metrics.mode_risk || {}).map(([k, v]) => (
                  <Tag key={k} color={(v as number) > 70 ? 'red' : (v as number) > 40 ? 'orange' : 'green'}>
                    {k}: {Math.round(v as number)}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {!loading && !metrics && <CentralText type="secondary">No metrics available</CentralText>}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
