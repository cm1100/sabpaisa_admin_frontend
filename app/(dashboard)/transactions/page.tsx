'use client';

import React, { useState, useEffect } from 'react';
import { 
  StyledStatistic, 
  CentralBadge, 
  StyledSpace, 
  CentralTitle,
  CentralText,
  CentralProgress, 
  CentralAlert 
, StyledCard } from '@/components/ui';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  WifiOutlined
} from '@ant-design/icons';
import TransactionTable from '@/components/tables/TransactionTable';
import { CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// Using centralized typography components

interface RealtimeMetric {
  label: string;
  value: number;
  change: number;
  status: 'success' | 'error' | 'processing';
}

const TransactionMonitoringPage: React.FC = () => {
  const responsive = useResponsive();
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetric[]>([
    { label: 'Success Rate', value: 98.5, change: 0.5, status: 'success' },
    { label: 'Avg Response Time', value: 234, change: -12, status: 'success' },
    { label: 'TPS (Transactions/sec)', value: 1250, change: 125, status: 'processing' },
    { label: 'Failed Transactions', value: 23, change: 5, status: 'error' }
  ]);

  const [liveData, setLiveData] = useState<number[]>([]);

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => setIsConnected(true), 1000);

    // Simulate real-time data updates
    const dataInterval = setInterval(() => {
      setLiveData(prev => {
        const newData = [...prev, Math.floor(Math.random() * 1500) + 500];
        return newData.slice(-20);
      });

      setRealtimeMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 5
      })));
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(dataInterval);
    };
  }, []);

  const realtimeChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: liveData.length }, (_, i) => 
        new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString()
      )
    },
    yAxis: {
      type: 'value',
      name: 'TPS',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: 'Transactions Per Second',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: 'var(--app-colorPrimary)'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(var(--color-primary-rgb), 0.3)' },
              { offset: 1, color: 'rgba(var(--color-primary-rgb), 0.05)' }
            ]
          }
        },
        data: liveData,
        animationDuration: 300
      }
    ]
  };

  const statusDistribution = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Transaction Status',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'var(--color-bg-elevated)',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 985, name: 'Success', itemStyle: { color: 'var(--app-colorSuccess)' } },
          { value: 23, name: 'Failed', itemStyle: { color: 'var(--app-colorError)' } },
          { value: 45, name: 'Pending', itemStyle: { color: 'var(--app-colorWarning)' } },
          { value: 12, name: 'Refunded', itemStyle: { color: 'var(--app-colorInfo)' } }
        ]
      }
    ]
  };

  return (
    <CentralPageContainer withBackground title="Transaction Monitor">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <CentralAlert
          message={
            <StyledSpace>
              {isConnected ? (
                <>
                  <CentralBadge status="success" />
                  <CentralText strong>Live Monitoring Active</CentralText>
                  <WifiOutlined  />
                </>
              ) : (
                <>
                  <CentralBadge status="processing" />
                  <CentralText strong>Connecting to WebSocket...</CentralText>
                  <SyncOutlined spin />
                </>
              )}
            </StyledSpace>
          }
          type={isConnected ? 'success' : 'info'}
          
          showIcon={false}
                  />

        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          
          animate
        >
          {realtimeMetrics.map((metric, index) => (
            <ResponsiveCol 
              {...LAYOUT_CONFIG.common.metricCard}
              key={index}
                          >
              <StyledCard>
                <StyledStatistic
                  title={metric.label}
                  value={metric.value}
                  precision={metric.label.includes('Rate') ? 1 : 0}
                  prefix={metric.label.includes('Rate') ? null : 
                    metric.label.includes('Time') ? null : <DollarOutlined />}
                  suffix={
                    <StyledSpace>
                      {metric.label.includes('Rate') && '%'}
                      {metric.label.includes('Time') && 'ms'}
                      {metric.change > 0 ? 
                        <ArrowUpOutlined  /> : 
                        <ArrowDownOutlined  />
                      }
                      <CentralText type={metric.change > 0 ? 'success' : 'danger'}>
                        {Math.abs(metric.change).toFixed(1)}%
                      </CentralText>
                    </StyledSpace>
                  }
                />
              </StyledCard>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.common.mainChart} >
            <StyledCard>
              <div>
                <CentralTitle level={4} >
                  Real-time Transaction Flow
                </CentralTitle>
                <CentralBadge status="processing" text="Live"  />
              </div>
              <ReactECharts 
                option={realtimeChartOption} 
                
                opts={{ renderer: 'svg' }}
              />
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget} >
            <StyledCard>
              <CentralTitle level={4} >
                Status Distribution
              </CentralTitle>
              <ReactECharts 
                option={statusDistribution} 
                
                opts={{ renderer: 'svg' }}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget} >
            <StyledCard>
              <StyledSpace direction="vertical" >
                <CentralText type="secondary">Payment Methods Performance</CentralText>
                <StyledSpace direction="vertical"  size="small">
                  <div>
                    <CentralText>UPI</CentralText>
                    <CentralProgress percent={95} status="success" size="small"  />
                  </div>
                  <div>
                    <CentralText>Credit Card</CentralText>
                    <CentralProgress percent={88} status="success" size="small"  />
                  </div>
                  <div>
                    <CentralText>Debit Card</CentralText>
                    <CentralProgress percent={92} status="success" size="small"  />
                  </div>
                  <div>
                    <CentralText>Net Banking</CentralText>
                    <CentralProgress percent={85} status="active" size="small"  />
                  </div>
                  <div>
                    <CentralText>Wallet</CentralText>
                    <CentralProgress percent={78} status="active" size="small"  />
                  </div>
                </StyledSpace>
              </StyledSpace>
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget} >
            <StyledCard>
              <StyledSpace direction="vertical" >
                <CentralText type="secondary">Top Performing Clients</CentralText>
                <StyledSpace direction="vertical"  size="small">
                  {[
                    { name: 'ABC University', amount: 4567890, change: 12 },
                    { name: 'XYZ College', amount: 3456789, change: -5 },
                    { name: 'LMN Institute', amount: 2345678, change: 8 },
                    { name: 'PQR School', amount: 1234567, change: 15 },
                    { name: 'STU Academy', amount: 987654, change: -2 }
                  ].map((client, index) => (
                    <div key={index} >
                      <CentralText>{client.name}</CentralText>
                      <StyledSpace>
                        <CentralText strong>₹{(client.amount / 100000).toFixed(1)}L</CentralText>
                        <CentralText type={client.change > 0 ? 'success' : 'danger'}>
                          {client.change > 0 ? '+' : ''}{client.change}%
                        </CentralText>
                      </StyledSpace>
                    </div>
                  ))}
                </StyledSpace>
              </StyledSpace>
            </StyledCard>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget} >
            <StyledCard>
              <StyledSpace direction="vertical" >
                <CentralText type="secondary">System Health</CentralText>
                <StyledSpace direction="vertical"  size="small">
                  <div >
                    <StyledSpace>
                      <CheckCircleOutlined  />
                      <CentralText>Payment Gateway</CentralText>
                    </StyledSpace>
                    <CentralBadge status="success" text="Operational" />
                  </div>
                  <div >
                    <StyledSpace>
                      <CheckCircleOutlined  />
                      <CentralText>API Services</CentralText>
                    </StyledSpace>
                    <CentralBadge status="success" text="Operational" />
                  </div>
                  <div >
                    <StyledSpace>
                      <CheckCircleOutlined  />
                      <CentralText>Database</CentralText>
                    </StyledSpace>
                    <CentralBadge status="success" text="Operational" />
                  </div>
                  <div >
                    <StyledSpace>
                      <ClockCircleOutlined  />
                      <CentralText>Settlement Service</CentralText>
                    </StyledSpace>
                    <CentralBadge status="warning" text="Delayed" />
                  </div>
                  <div >
                    <StyledSpace>
                      <CheckCircleOutlined  />
                      <CentralText>Notification Service</CentralText>
                    </StyledSpace>
                    <CentralBadge status="success" text="Operational" />
                  </div>
                </StyledSpace>
              </StyledSpace>
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        <StyledCard>
          <TransactionTable />
        </StyledCard>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
};

export default TransactionMonitoringPage;
