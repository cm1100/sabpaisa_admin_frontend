'use client';

import React from 'react';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { StatisticCard } from '@/components/ui';
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';
const { Text } = Typography;

interface SettlementMetricsProps {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  pendingAmount: number;
  processingAmount: number;
  completedAmount: number;
  failedAmount: number;
}

const SettlementMetrics: React.FC<SettlementMetricsProps> = React.memo(({
  pending,
  processing,
  completed,
  failed,
  pendingAmount,
  processingAmount,
  completedAmount,
  failedAmount
}) => {
  const formatAmount = (amount: number) => 
    `₹${(amount / 100000).toFixed(1)}L`;

  return (
    <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} style={{ marginBottom: 24 }}>
      <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
        <StatisticCard
          statistic={{
            title: 'Pending Settlements',
            value: pending,
            icon: <ClockCircleOutlined style={{ color: 'var(--color-warning)' }} />,
            description: <Text type="secondary">{formatAmount(pendingAmount)} total</Text>
          }}
        />
      </ResponsiveCol>
      <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
        <StatisticCard
          statistic={{
            title: 'Processing',
            value: processing,
            icon: <SyncOutlined spin style={{ color: 'var(--color-info)' }} />,
            description: <Text type="secondary">{formatAmount(processingAmount)} total</Text>
          }}
        />
      </ResponsiveCol>
      <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
        <StatisticCard
          statistic={{
            title: 'Completed Today',
            value: completed,
            icon: <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />,
            description: <Text type="secondary">{formatAmount(completedAmount)} total</Text>
          }}
        />
      </ResponsiveCol>
      <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
        <StatisticCard
          statistic={{
            title: 'Failed',
            value: failed,
            icon: <CloseCircleOutlined style={{ color: 'var(--color-error)' }} />,
            description: <Text type="secondary">{formatAmount(failedAmount)} total</Text>
          }}
        />
      </ResponsiveCol>
    </ResponsiveRow>
  );
});

SettlementMetrics.displayName = 'SettlementMetrics';

export default SettlementMetrics;
