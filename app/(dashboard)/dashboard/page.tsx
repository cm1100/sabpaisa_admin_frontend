/**
 * Main Dashboard Page - Fully Responsive with Theme Integration
 * Implements all dashboard requirements with perfect mobile experience
 */
'use client';

import React, { useEffect, useState } from 'react';
import { theme } from '@/components/ui';
import {
  StyledCard,
  StyledSpace,
  StyledStatistic,
  CentralButton,
  CentralBadge,
  CentralTag,
  CentralAlert,
  CentralProgress,
  CentralTable,
  CentralTitle,
  CentralText,
  CentralSegmented,
  Spin,
  Tooltip,
} from '@/components/ui';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  ExportOutlined,
  SettingOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ResponsiveChart } from '@/components/charts/ResponsiveChart';
import { SuccessRateGauge } from '@/components/charts/SuccessRateGauge';
import { ResponsiveRow, ResponsiveCol, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { Dropdown } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import { getChartConfig, MiniChartConfig } from '@/config/chartConfigs';
import { TrendLine, VolumeBar, SimpleLine } from '@/components/charts/StatCardChart';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { Empty } from '@/components/ui';
import CentralPageContainer from '@/components/ui/CentralPageContainer';

// Typography components are now imported as CentralTitle and CentralText

const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const responsive = useResponsive();
  const {
    metrics,
    trends,
    hourlyData,
    paymentMethods,
    topClients,
    recentAlerts,
    isLoading,
    isRefreshing,
    fetchDashboardData,
    refreshDashboardData,
    setTimeRange,
    timeRange,
  } = useDashboardStore();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Debug: snapshot header and card contrast to catch white-on-white flips
  useEffect(() => {
    const parseRGB = (input: string) => {
      const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
      if (!m) return null as any;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
    };
    const rel = (c: number) => {
      const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminance = (rgb: any) => 0.2126 * rel(rgb.r) + 0.7152 * rel(rgb.g) + 0.0722 * rel(rgb.b);
    const contrast = (rgb1: any, rgb2: any) => {
      const L1 = luminance(rgb1) + 0.05; const L2 = luminance(rgb2) + 0.05; return L1 > L2 ? L1 / L2 : L2 / L1;
    };
    const check = (label: string) => {
      const header = document.querySelector('.ant-page-header-heading-title') as HTMLElement | null;
      if (!header) return;
      const cs = getComputedStyle(header);
      const color = parseRGB(cs.color);
      let el: HTMLElement | null = header; let bg: any = null;
      while (el && !bg) {
        const bgc = getComputedStyle(el).backgroundColor; const parsed = parseRGB(bgc);
        if (parsed && parsed.a > 0) bg = parsed; el = el.parentElement;
      }
      if (!bg) { const b = getComputedStyle(document.body).backgroundColor; bg = parseRGB(b); }
      if (color && bg) {
        const ratio = contrast(color, bg);
        if (ratio < 4.5) {
          // eslint-disable-next-line no-console
          console.warn(`[contrast] ${label} header contrast too low:`, { ratio, color: cs.color, bg });
        } else {
          // eslint-disable-next-line no-console
          console.log(`[contrast] ${label} header contrast OK:`, { ratio, color: cs.color });
        }
      }
    };
    // Initial snapshot
    setTimeout(() => check('initial'), 0);
    // After charts render
    setTimeout(() => check('post-charts'), 800);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(() => {
      fetchDashboardData();
    }, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Get chart configurations using factory pattern (SOLID)
  const chartContext = {
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    width: responsive.width,
    height: responsive.height,
    colorPrimary: token.colorPrimary,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
    colorInfo: token.colorInfo,
  };

  // Transaction Volume Chart Options - Using factory
  const transactionVolumeOptions = getChartConfig(
    'transactionVolume',
    { hourlyData },
    chartContext
  ) || {};

  // Payment Methods Pie Chart - Using factory
  const paymentMethodsOptions = getChartConfig(
    'paymentMethods',
    { paymentMethods },
    chartContext
  ) || {};

  // Success Rate Gauge Chart
  const successRateOptions = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        center: ['50%', '75%'],
        radius: '90%',
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, token.colorError],
              [0.7, token.colorWarning],
              [1, token.colorSuccess],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          distance: -20,
          length: 8,
          lineStyle: {
            color: token.colorBgBase,
            width: 2,
          },
        },
        splitLine: {
          distance: -25,
          length: 25,
          lineStyle: {
            color: token.colorBgBase,
            width: 4,
          },
        },
        axisLabel: {
          color: token.colorTextBase,
          distance: 30,
          fontSize: 12,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: token.colorTextBase,
          fontSize: 16,
          fontWeight: 'bold',
          offsetCenter: [0, '0%'],
        },
        data: [
          {
            value: metrics?.successRate || 0,
            name: 'Success Rate',
          },
        ],
      },
    ],
  };

  if (isLoading && !metrics) {
    return (
      <CentralPageContainer withBackground title="Dashboard Overview">
        <div data-testid="dashboard-overview-loading">
          <PremiumLoader size="large" message="Loading dashboard..." variant="info" />
        </div>
      </CentralPageContainer>
    );
  }

  const headerExtra = (
    <StyledSpace size="compact" wrap>
      {responsive.isMobile ? (
        <>
          <Tooltip title="Refresh">
            <CentralButton 
              data-testid="dashboard-overview-refresh"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={() => refreshDashboardData()}
              loading={isRefreshing}
              size="small"
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'range',
                  label: (
                    <CentralSegmented
                      data-testid="dashboard-overview-range"
                      options={[
                        { label: '24H', value: '24h' },
                        { label: '7D', value: '7d' },
                        { label: '30D', value: '30d' },
                        { label: '90D', value: '90d' },
                      ]}
                      value={timeRange}
                      onChange={(value) => setTimeRange(value as any)}
                    />
                  ),
                },
                {
                  key: 'export',
                  label: 'Export',
                  icon: <ExportOutlined />,
                  onClick: () => {/* handled in FE via service; placeholder */},
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  icon: <SettingOutlined />,
                },
                {
                  key: 'auto',
                  label: autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh',
                  onClick: () => setAutoRefresh(!autoRefresh),
                },
              ]
            }}
          >
            <CentralButton size="small">More</CentralButton>
          </Dropdown>
        </>
      ) : (
        <>
          <CentralSegmented
            data-testid="dashboard-overview-range"
            options={[
              { label: '🕐 24H', value: '24h' },
              { label: '📅 7D', value: '7d' },
              { label: '📊 30D', value: '30d' },
              { label: '📈 90D', value: '90d' },
            ]}
            value={timeRange}
            onChange={(value) => setTimeRange(value as any)}
          />
          <Tooltip title="Export Data">
            <CentralButton 
              data-testid="dashboard-overview-export"
              icon={<ExportOutlined />}
            >
              Export
            </CentralButton>
          </Tooltip>
          <Tooltip title="Refresh Dashboard Data">
            <CentralButton 
              data-testid="dashboard-overview-refresh"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={() => refreshDashboardData()}
              loading={isRefreshing}
            >
              Refresh
            </CentralButton>
          </Tooltip>
          <Tooltip title={autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}>
            <CentralButton 
              type={autoRefresh ? 'primary' : 'default'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              data-testid="dashboard-overview-auto-refresh"
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </CentralButton>
          </Tooltip>
          <Tooltip title="Dashboard Settings">
            <CentralButton 
              icon={<SettingOutlined />}
              data-testid="dashboard-overview-settings"
            />
          </Tooltip>
        </>
      )}
    </StyledSpace>
  );

  return (
    <CentralPageContainer withBackground title="Dashboard Overview" extra={headerExtra}>
      <div data-testid="dashboard-overview">
        {/* Header moved to PageContainer.extra for consistency */}

        {/* System Alerts */}
        {recentAlerts && recentAlerts.length > 0 && (
          <ResponsiveRow 
            mobileGutter={[12, 12]} 
            tabletGutter={[16, 16]} 
            desktopGutter={[24, 24]}
              animate
          >
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
              <div>
                {recentAlerts.slice(0, 1).map((alert: any) => (
                  <CentralAlert
                    key={alert.id}
                    message={alert.message}
                    type={alert.type as any}
                    showIcon
                    closable
                    action={
                      <CentralButton size="small" type="link">
                        View Details
                      </CentralButton>
                    }
                  />
                ))}
              </div>
            </ResponsiveCol>
          </ResponsiveRow>
        )}

        {/* Main Metrics Cards */}
        <ResponsiveRow gutter={16} animate>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledStatistic
              title="Today's Transactions"
              value={metrics?.totalTransactions || 0}
              suffix="txns"
              trend={{
                value: Math.abs(trends?.transactions?.trend || 0),
                isUp: (trends?.transactions?.trend || 0) > 0
              }}
              chart={
                <TrendLine
                  data={[400, 420, 450, 480, 520, 580, 690, 780]}
                  color={token.colorPrimary}
                  height={40}
                />
              }
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledStatistic
              title="Today's Volume"
              value={(() => {
                const numValue = metrics?.todayVolume || 0;
                const cr = numValue / 10000000;
                return `${cr.toFixed(2)} Cr`;
              })()}
              prefix="₹"
              trend={{
                value: Math.abs(trends?.volume?.trend || 0),
                isUp: (trends?.volume?.trend || 0) > 0
              }}
              chart={
                <VolumeBar
                  data={[30, 40, 35, 50, 49, 60, 70, 91]}
                  color={token.colorSuccess}
                  height={40}
                />
              }
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledStatistic
              title="Success Rate"
              value={(metrics?.successRate || 0).toFixed(2)}
              suffix="%"
              description={
                <StyledSpace size="compact">
                  <CentralBadge status="success" />
                  <CentralText>
                    {(trends?.successRate?.trend || 0) > 0 ? 'Improving' : 'Declining'}
                  </CentralText>
                </StyledSpace>
              }
              chart={
                <SuccessRateGauge 
                  value={metrics?.successRate || 0}
                  height={40}
                />
              }
            />
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledStatistic
              title="Active Clients"
              value={(metrics?.activeClients || 0).toLocaleString()}
              description={
                <StyledSpace size="compact">
                  <ThunderboltOutlined />
                  <CentralText>
                    {metrics?.pendingSettlements || 0} pending settlements
                  </CentralText>
                </StyledSpace>
              }
              chart={
                <SimpleLine
                  data={[120, 132, 101, 134, 90, 230, 210, 180]}
                  color={token.colorInfo}
                  height={40}
                />
              }
            />
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Charts Row */}
        <ResponsiveRow gutter={16} animate>
          <ResponsiveCol {...LAYOUT_CONFIG.dashboard.mainChart}>
            <StyledCard
              variant="interactive"
              title="Transaction Volume & Count"
              extra={<span aria-hidden>📊</span>}
              data-testid="dashboard-overview-volume-chart"
            >
              <ResponsiveChart 
                option={transactionVolumeOptions}
                renderer="svg"
                height={{ 
                  xs: 250,
                  sm: 280,
                  md: 300,
                  lg: 320,
                  xl: 350
                }}
                minHeight={200}
                maxHeight={400}
                loading={isLoading}
              />
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.dashboard.sideChart}>
            <StyledCard
              variant="interactive"
              title="Payment Methods"
              extra={<span aria-hidden>🥧</span>}
              data-testid="dashboard-overview-payment-modes"
            >
              <ResponsiveChart 
                option={paymentMethodsOptions}
                renderer="svg"
                height={{ 
                  xs: 250,
                  sm: 280,
                  md: 300,
                  lg: 320,
                  xl: 350
                }}
                minHeight={200}
                maxHeight={400}
                loading={isLoading}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Bottom Row */}
        <ResponsiveRow gutter={16} animate>
          <ResponsiveCol {...LAYOUT_CONFIG.dashboard.infoCard}>
            <StyledCard
              variant="stat"
              title="Success Rate Monitor"
              extra={<CentralBadge status="processing" text="Live" />}
              data-testid="dashboard-overview-success-rate"
            >
              <div>
                <ResponsiveChart
                  option={successRateOptions as any}
                  renderer="svg"
                  height={{ xs: 220, sm: 240, md: 260, lg: 280, xl: 300 }}
                />
              </div>
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.dashboard.infoCard}>
            <StyledCard
              variant="bordered"
              title="Top Clients"
              extra={<CentralButton type="link" size="small">View All</CentralButton>}
              data-testid="dashboard-overview-top-clients"
            >
              {(!topClients || topClients.length === 0) ? (
                <Empty description="No top clients data" data-testid="dashboard-overview-top-clients-empty" />
              ) : (
                <CentralTable
                  dataSource={topClients}
                  rowKey="name"
                  columns={[
                  {
                    title: 'Client',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => <CentralText strong>{text}</CentralText>,
                  },
                  {
                    title: 'Volume',
                    dataIndex: 'volume',
                    key: 'volume',
                    align: 'right',
                    render: (value) => `₹${(value / 10000000).toFixed(2)} Cr`,
                  },
                  {
                    title: 'Growth',
                    dataIndex: 'growth',
                    key: 'growth',
                    align: 'center',
                    render: (value) => {
                      const isUp = value > 0;
                      const c = isUp ? token.colorSuccess : token.colorError;
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: hexToRgba(c, 0.15),
                            color: c,
                            fontWeight: 600,
                          }}
                        >
                          {isUp ? <RiseOutlined /> : <FallOutlined />}
                          {Math.abs(value).toFixed(1)}%
                        </span>
                      );
                    },
                  },
                  ]}
                  pagination={false}
                  size={responsive.isMobile ? 'small' : 'middle'}
                  enableColumnControls
                  stickyHeader
                  id="dashboard-top-clients"
                />
              )}
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.dashboard.infoCard}>
            <StyledCard
              variant="stat"
              title="System Performance"
              extra={<span aria-hidden>⏱️</span>}
              data-testid="dashboard-overview-system-performance"
            >
              <StyledSpace direction="vertical" size="spacious">
                <div>
                  <CentralText type="secondary">Average Response Time</CentralText>
                  <StyledSpace direction="vertical" size="compact">
                    <CentralText>
                      {metrics?.avgResponseTime || 0} ms
                    </CentralText>
                  </StyledSpace>
                </div>
              </StyledSpace>
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>
      </div>
    </CentralPageContainer>
  );
};

export default DashboardPage;
