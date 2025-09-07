'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, Empty, StyledSpace, CentralSegmented } from '@/components/ui';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { dashboardService } from '@/services/api/DashboardApiService';

export default function DashboardRealtimePage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState<'20' | '30' | '50'>('30');

  useEffect(() => {
    let mounted = true;
    let interval: any;
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getLiveFeed(parseInt(limit));
        if (mounted) setFeed(data || []);
      } finally {
        setLoading(false);
      }
    })();
    interval = setInterval(async () => {
      try {
        const data = await dashboardService.getLiveFeed(parseInt(limit));
        if (mounted) setFeed(data || []);
      } catch {}
    }, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [limit]);

  return (
    <CentralPageContainer withBackground title="Real-time Monitor">
      <StyledSpace fullWidth justify="space-between" alignItems="center" style={{ marginBottom: 12 }}>
        <CentralTitle level={4} style={{ margin: 0 }}>Real-time Monitor</CentralTitle>
        <CentralSegmented
          data-testid="dashboard-realtime-limit"
          options={[
            { label: '20', value: '20' },
            { label: '30', value: '30' },
            { label: '50', value: '50' },
          ]}
          value={limit}
          onChange={(v) => setLimit(v as any)}
        />
      </StyledSpace>

      <ResponsiveRow gutter={16}>
        <ResponsiveCol span={24}>
          <StyledCard title="Live Events" data-testid="dashboard-realtime">
          {loading && (
            <div data-testid="dashboard-realtime-loading">
              <PremiumLoader size="default" message="Loading live events..." variant="info" />
            </div>
          )}
          <List
            size="small"
            dataSource={feed}
            data-testid="dashboard-realtime-list"
            renderItem={(item: any) => (
              <List.Item>
                <CentralText>
                  <Tag color={item.status === 'SUCCESS' ? 'success' : item.status === 'FAILED' ? 'error' : 'warning'}>
                    {item.status}
                  </Tag>
                  {item.txn_id || item.id} • ₹{item.amount || item.paid_amount} • {item.payment_mode}
                  {item.client_name ? ` • ${item.client_name}` : ''}
                  {item.timestamp ? ` • ${new Date(item.timestamp).toLocaleTimeString()}` : ''}
                </CentralText>
              </List.Item>
            )}
          />
          {!loading && feed.length === 0 && (
            <Empty description="No live events" data-testid="dashboard-realtime-empty" />
          )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
    </CentralPageContainer>
  );
}
