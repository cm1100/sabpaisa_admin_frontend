/**
 * Centralized Statistic Component
 * Uses Ant Design's StatisticCard with proper theming
 */

'use client';

import React from 'react';
import { StatisticCard } from '@ant-design/pro-components';
import { Space, theme } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';

interface StyledStatisticProps {
  title: string;
  value: number | string;
  precision?: number;
  formatter?: (value: number | string) => string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  prefix?: React.ReactNode | string;
  suffix?: React.ReactNode | string;
  description?: React.ReactNode;
  loading?: boolean;
  chart?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StyledStatistic: React.FC<StyledStatisticProps> = ({
  title,
  value,
  precision,
  formatter,
  icon,
  trend,
  prefix,
  suffix,
  description,
  loading = false,
  chart,
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const responsive = useResponsive();

  const formatValue = () => {
    if (formatter) return formatter(value);
    if (typeof value === 'number' && typeof precision === 'number') {
      return value.toFixed(precision);
    }
    return value as any;
  };

  const trendComponent = trend ? (
    <Space size={4}>
      {trend.isUp ? (
        <ArrowUpOutlined color={token.colorSuccess} />
      ) : (
        <ArrowDownOutlined color={token.colorError} />
      )}
      <span>
        {Math.abs(trend.value)}%
      </span>
    </Space>
  ) : undefined;

  return (
    <StatisticCard
      className={className}
      style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: token.borderRadiusLG,
        ...(style || {}),
      }}
      loading={loading}
      statistic={{
        title: (
          <Space>
            {icon}
            <span>{title}</span>
          </Space>
        ),
        value: formatValue(),
        prefix,
        suffix,
        description: description || trendComponent,
      }}
      chart={chart}
      chartPlacement={responsive.isMobile ? 'bottom' : 'left'}
    />
  );
};

export default StyledStatistic;
