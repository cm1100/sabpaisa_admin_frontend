/**
 * Mini Chart Component
 * SOLID Principle: Single Responsibility - Handles small inline charts
 * Properly sized for StatisticCards
 */
'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
type EChartsOption = any;

interface MiniChartProps {
  type: 'line' | 'bar';
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

/**
 * MiniChart Component
 * Displays small charts optimized for StatisticCards
 * Follows Single Responsibility Principle
 */
export const MiniChart: React.FC<MiniChartProps> = ({
  type = 'line',
  data = [],
  color = 'var(--color-primary)',
  height = 60,
  className = '',
}) => {
  
  // Generate chart option based on type
  const chartOption = useMemo<EChartsOption>(() => {
    const baseOption: EChartsOption = {
      xAxis: { 
        show: false, 
        type: 'category',
        data: data.map((_, i) => i)
      },
      yAxis: { 
        show: false,
        scale: true
      },
      grid: { 
        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0,
        containLabel: false
      },
      series: []
    };

    if (type === 'line') {
      baseOption.series = [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: color,
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: toRgba(color, 0.2) },
              { offset: 1, color: toRgba(color, 0.02) }
            ]
          }
        },
        data: data,
        animation: false,
      }];
    } else if (type === 'bar') {
      baseOption.series = [{
        type: 'bar',
        barWidth: '50%',
        barGap: '10%',
        itemStyle: {
          color: color,
          borderRadius: [2, 2, 0, 0],
        },
        data: data,
        animation: false,
      }];
    }

    return baseOption;
  }, [type, data, color]);

  // Helper function to convert hex to rgba
  function toRgba(col: string, alpha: number): string {
    if (col.startsWith('#')) {
      const r = parseInt(col.slice(1, 3), 16);
      const g = parseInt(col.slice(3, 5), 16);
      const b = parseInt(col.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (col.startsWith('var(')) {
      if (col.includes('--color-primary')) return `rgba(var(--color-primary-rgb), ${alpha})`;
      if (col.includes('--color-success')) return `rgba(var(--color-success-rgb), ${alpha})`;
      if (col.includes('--color-info')) return `rgba(var(--color-info-rgb), ${alpha})`;
      if (col.includes('--color-warning')) return `rgba(var(--color-warning-rgb), ${alpha})`;
      if (col.includes('--color-error')) return `rgba(var(--color-error-rgb), ${alpha})`;
    }
    return col;
  }

  return (
    <div style={{ height: height }}>
      <ReactECharts
        option={chartOption}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

/**
 * Sparkline Component
 * Simplified line chart for trend indication
 */
export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = 'var(--color-primary)', height = 60 }) => {
  return (
    <MiniChart
      type="line"
      data={data}
      color={color}
      height={height}
    />
  );
};

/**
 * MiniBarChart Component
 * Simplified bar chart for volume indication
 */
export const MiniBarChart: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = 'var(--color-success)', height = 60 }) => {
  return (
    <MiniChart
      type="bar"
      data={data}
      color={color}
      height={height}
    />
  );
};

export default MiniChart;
