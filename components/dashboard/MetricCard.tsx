'use client';

import React, { useMemo } from 'react';
import { StyledStatistic } from '@/components/ui';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import { TrendData } from '@/types';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: TrendData;
  prefix?: string;
  suffix?: string;
  color?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = React.memo(({
  title,
  value,
  icon,
  trend,
  prefix,
  suffix,
  color = 'var(--color-info)',
  loading = false
}) => {
  const { isMobile } = useResponsive();

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN');
    }
    return value;
  }, [value]);

  // Convert TrendData to StyledStatistic trend format
  const trendData = useMemo(() => {
    if (!trend) return undefined;
    
    return {
      value: Math.abs(trend.changePercent),
      isUp: trend.changePercent > 0
    };
  }, [trend]);

  return (
    <StyledStatistic
      title={title}
      value={formattedValue}
      icon={icon}
      trend={trendData}
      prefix={prefix}
      suffix={suffix}
      loading={loading}
    />
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
