/**
 * Test Responsive Page
 * For testing dashboard components on different screen sizes
 */
'use client';

import React, { useState } from 'react';
import { StyledCard as Card, StyledSpace as Space, CentralButton as Button } from '@/components/ui';
import { CentralTitle as Title, CentralText as Text } from '@/components/ui';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { Segmented } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { StatisticCard } from '@/components/ui';
import { TrendLine, VolumeBar, SimpleLine } from '@/components/charts/StatCardChart';
import { SuccessRateGauge } from '@/components/charts/SuccessRateGauge';
import { ResponsiveChart } from '@/components/charts/ResponsiveChart';
import { getChartConfig } from '@/config/chartConfigs';
import { theme } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';


export default function TestResponsivePage() {
  const { token } = theme.useToken();
  const responsive = useResponsive();
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop' | 'auto'>('auto');

  // Mock data
  const mockData = {
    transactions: [400, 420, 450, 480, 520, 580, 690, 780],
    volume: [30, 40, 35, 50, 49, 60, 70, 91],
    clients: [120, 132, 101, 134, 90, 230, 210, 180],
    successRate: 97.78,
  };

  // Determine container width based on view mode
  const getContainerStyle = () => {
    switch (viewMode) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      case 'desktop':
        return { maxWidth: '1440px', margin: '0 auto' };
      default:
        return {};
    }
  };

  const chartContext = {
    isMobile: viewMode === 'mobile' || (viewMode === 'auto' && responsive.isMobile),
    isTablet: viewMode === 'tablet' || (viewMode === 'auto' && responsive.isTablet),
    isDesktop: viewMode === 'desktop' || (viewMode === 'auto' && responsive.isDesktop),
    width: responsive.width,
    height: responsive.height,
    colorPrimary: token.colorPrimary,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
    colorInfo: token.colorInfo,
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)', background: 'var(--color-bg-secondary)', minHeight: '100vh' }}>
      {/* Test Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>Responsive Test Dashboard</Title>
          
          <Space wrap>
            <Text strong>View Mode:</Text>
            <Segmented
              options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Mobile (375px)', value: 'mobile' },
                { label: 'Tablet (768px)', value: 'tablet' },
                { label: 'Desktop (1440px)', value: 'desktop' },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
            />
          </Space>

          <Space wrap>
            <Text>Current Breakpoint: <strong>{responsive.breakpoint}</strong></Text>
            <Text>Width: <strong>{responsive.width}px</strong></Text>
            <Text>Height: <strong>{responsive.height}px</strong></Text>
            <Text>Device: <strong>
              {responsive.isMobile ? 'Mobile' : 
               responsive.isTablet ? 'Tablet' : 
               responsive.isDesktop ? 'Desktop' : 
               'Large Desktop'}
            </strong></Text>
          </Space>
        </Space>
      </Card>

      {/* Test Container */}
      <div style={getContainerStyle()}>
        {/* Test StatisticCards with Mini Charts */}
        <Title level={4}>StatisticCards with Charts</Title>
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StatisticCard
              title="Today's Transactions"
              statistic={{
                value: 11969,
                suffix: 'txns',
              }}
              chart={
                <TrendLine
                  data={mockData.transactions}
                  color="var(--color-primary)"
                  height={60}
                />
              }
              style={{ height: 180 }}
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StatisticCard
              title="Today's Volume"
              statistic={{
                value: 8.63,
                prefix: '₹',
                suffix: 'Cr',
              }}
              chart={
                <VolumeBar
                  data={mockData.volume}
                  color="var(--color-success)"
                  height={60}
                />
              }
              style={{ height: 180 }}
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StatisticCard
              title="Success Rate"
              statistic={{
                value: mockData.successRate,
                suffix: '%',
                precision: 2,
              }}
              chart={
                <SuccessRateGauge
                  value={mockData.successRate}
                  height={60}
                />
              }
              style={{ height: 180 }}
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StatisticCard
              title="Active Clients"
              statistic={{
                value: 342,
              }}
              chart={
                <SimpleLine
                  data={mockData.clients}
                  color="var(--color-info)"
                  height={60}
                />
              }
              style={{ height: 180 }}
            />
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Test Larger Charts */}
        <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>Responsive Charts</Title>
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
            <Card title="Transaction Volume">
              <ResponsiveChart
                option={getChartConfig(
                  'transactionVolume',
                  { 
                    hourlyData: Array.from({ length: 24 }, (_, i) => ({
                      hour: `${i}:00`,
                      volume: Math.random() * 1000000,
                      transactions: Math.floor(Math.random() * 1000),
                    }))
                  },
                  chartContext
                ) || {}}
                height={{ xs: 200, sm: 250, md: 300, lg: 350 }}
              />
            </Card>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
            <Card title="Payment Methods">
              <ResponsiveChart
                option={getChartConfig(
                  'paymentMethods',
                  {
                    paymentMethods: [
                      { method: 'UPI', count: 450 },
                      { method: 'Debit Card', count: 320 },
                      { method: 'Credit Card', count: 280 },
                      { method: 'Net Banking', count: 150 },
                      { method: 'Wallet', count: 100 },
                    ]
                  },
                  chartContext
                ) || {}}
                height={{ xs: 200, sm: 250, md: 300, lg: 350 }}
              />
            </Card>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Test Different Chart Heights */}
        <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>Chart Height Variations</Title>
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
          {[40, 60, 80, 100].map((height) => (
            <ResponsiveCol key={height} {...LAYOUT_CONFIG.common.metricCard}>
              <Card title={`Height: ${height}px`}>
                <TrendLine
                  data={mockData.transactions}
                  color="var(--color-primary)"
                  height={height}
                />
              </Card>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>
      </div>
    </div>
  );
}
