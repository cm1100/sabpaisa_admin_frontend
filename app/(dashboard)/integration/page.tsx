'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralButton as Button, List, Tag, Spin, CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import Link from 'next/link';

export default function IntegrationLandingPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/health/`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  return (
    <CentralPageContainer withBackground title="Integration" subTitle="Manage webhooks, API keys, health and logs">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard data-testid="integration-landing">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/integration/webhooks"><Button type="primary">Webhooks</Button></Link>
            <Link href="/integration/api-keys"><Button>API Keys</Button></Link>
            <Link href="/integration/health"><Button>Health Monitor</Button></Link>
            <Link href="/integration/logs"><Button>API Logs</Button></Link>
          </div>
            <CentralTitle level={5}>System Health</CentralTitle>
          {loading ? <Spin /> : (
            <CentralText>
              <Tag color={health?.status === 'healthy' ? 'green' : 'orange'}>{health?.status || 'unknown'}</Tag>
              Service: {health?.service || '-'} • {health?.timestamp ? new Date(health.timestamp).toLocaleString() : ''}
            </CentralText>
          )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
