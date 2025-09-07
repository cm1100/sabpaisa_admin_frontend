'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Spin, CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';

export default function IntegrationHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/health/`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        setHealth(data);
      } catch (e) {
        setHealth({ status: 'unknown', error: String(e) });
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, [apiBase]);

  return (
    <CentralPageContainer withBackground title="Integration Health">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard data-testid="stub-integration-health">
          <CentralTitle level={4}>Integration Health</CentralTitle>
          {loading ? (
            <Spin />
          ) : (
            <div style={{ marginTop: 12 }}>
              <CentralText>Service: {health?.service || '-'}</CentralText>
              <div><CentralText>Status: {health?.status || '-'}</CentralText></div>
              <div><CentralText>Database: {health?.database || '-'}</CentralText></div>
            </div>
          )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
