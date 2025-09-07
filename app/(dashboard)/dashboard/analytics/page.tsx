'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Empty, CentralSegmented, StyledSpace } from '@/components/ui';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { dashboardService } from '@/services/api/DashboardApiService';
import { ResponsiveChart } from '@/components/charts/ResponsiveChart';

export default function DashboardAnalyticsPage() {
  const [hourly, setHourly] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');

  const hours = useMemo(() => ({ '24h': 24, '7d': 168, '30d': 720, '90d': 2160 }[range]), [range]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [h, pm, tc] = await Promise.all([
          dashboardService.getHourlyVolumeChart(hours),
          dashboardService.getPaymentMethodDistribution(range),
          dashboardService.getTopClientsChart(10, range),
        ]);
        const asArray = (v: any) => Array.isArray(v) ? v : (v && Array.isArray(v.data) ? v.data : []);
        setHourly(asArray(h));
        setPaymentModes(asArray(pm));
        setTopClients(asArray(tc));
      } finally {
        setLoading(false);
      }
    })();
  }, [hours, range]);

  const hourlyOpts = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: hourly.map((x: any) => x.hour || x.label) },
    yAxis: { type: 'value', name: 'Txn Count' },
    series: [{ type: 'line', smooth: true, areaStyle: {}, data: hourly.map((x: any) => x.volume ?? x.value ?? 0) }],
  };

  const paymentOpts = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      itemStyle: { borderColor: 'var(--app-colorBgElevated)', borderWidth: 2 },
      data: paymentModes.map((x: any) => ({
        name: x?.name || x?.label || x?.mode,
        value: x?.value ?? x?.count ?? x?.percentage ?? 0,
      }))
    }],
  };

  const clientsOpts = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: topClients.map((x: any) => x.name) },
    yAxis: { type: 'value', name: 'Volume (₹ Cr)', axisLabel: { formatter: (v: number) => (v/10000000).toFixed(1) } },
    series: [{ type: 'bar', itemStyle: { color: 'var(--app-colorPrimary)' }, data: topClients.map((x: any) => x.volume ?? x.value ?? 0) }],
  };

  return (
    <CentralPageContainer withBackground title="Analytics Overview">
      <StyledSpace fullWidth justify="space-between" alignItems="center" style={{ marginBottom: 12 }}>
        <CentralTitle level={4} style={{ margin: 0 }}>Analytics</CentralTitle>
        <CentralSegmented
          data-testid="dashboard-analytics-range"
          options={[
            { label: '24H', value: '24h' },
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' },
            { label: '90D', value: '90d' },
          ]}
          value={range}
          onChange={(v) => setRange(v as any)}
        />
      </StyledSpace>

      {loading && (
        <div data-testid="dashboard-analytics-loading">
          <PremiumLoader size="default" message="Loading analytics..." variant="info" />
        </div>
      )}

      <ResponsiveRow gutter={16}>
        <ResponsiveCol xs={24}>
          <StyledCard title={`Hourly Volume (${range.toUpperCase()})`} data-testid="dashboard-analytics-hourly">
            {hourly.length === 0 ? (
              <Empty description="No hourly data" data-testid="dashboard-analytics-hourly-empty" />
            ) : (
              <ResponsiveChart option={hourlyOpts as any} renderer="svg" height={{ xs: 220, sm: 260, md: 300, lg: 320, xl: 360 }} />
            )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      <ResponsiveRow gutter={16}>
        <ResponsiveCol xs={24} lg={12}>
          <StyledCard title="Payment Modes" data-testid="dashboard-analytics-payment-modes">
            {paymentModes.length === 0 ? (
              <Empty description="No payment mode data" data-testid="dashboard-analytics-payment-modes-empty" />
            ) : (
              <ResponsiveChart option={paymentOpts as any} renderer="svg" height={{ xs: 220, sm: 240, md: 260, lg: 280, xl: 300 }} />
            )}
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol xs={24} lg={12}>
          <StyledCard title="Top Clients" data-testid="dashboard-analytics-top-clients">
            {topClients.length === 0 ? (
              <Empty description="No top clients data" data-testid="dashboard-analytics-top-clients-empty" />
            ) : (
              <ResponsiveChart option={clientsOpts as any} renderer="svg" height={{ xs: 220, sm: 240, md: 260, lg: 280, xl: 300 }} />
            )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      {!loading && hourly.length === 0 && paymentModes.length === 0 && topClients.length === 0 && (
        <Empty description="No analytics data" data-testid="dashboard-analytics-empty" />
      )}
    </CentralPageContainer>
  );
}
