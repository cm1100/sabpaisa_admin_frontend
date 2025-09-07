/**
 * StatCardChart Component
 * SOLID Principle: Single Responsibility - Handles charts specifically for StatisticCard
 * Optimized for small inline charts within dashboard cards
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
type EChartsOption = any;

interface StatCardChartProps {
  type: 'line' | 'bar' | 'area';
  data: number[];
  color?: string;
  height?: number;
  showGrid?: boolean;
}

/**
 * StatCardChart Component
 * Optimized for StatisticCard chart prop
 * Uses direct ECharts instance for better control
 */
export const StatCardChart: React.FC<StatCardChartProps> = ({
  type = 'line',
  data = [],
  color = 'var(--color-primary)',
  height = 60,
  showGrid = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    let chart: echarts.ECharts | null = null;
    let handleResize: (() => void) | null = null;
    if (chartRef.current) {
      chart = echarts.init(chartRef.current, null, {
        renderer: 'svg',
        width: chartRef.current.offsetWidth || undefined,
        height: height,
      });
      setChartInstance(chart);
      handleResize = () => { chart && chart.resize(); };
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (chart) chart.dispose();
    };
  }, [height]);

  useEffect(() => {
    if (!chartInstance || !data.length) {
      return () => {};
    }

    const option: EChartsOption = {
      animation: false,
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        show: false,
        data: data.map((_, i) => i),
      },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
        min: function(value: any) {
          return value.min - (value.max - value.min) * 0.1;
        },
      },
      series: [],
    };

    // Helper to convert to rgba inside scope
    const rgba = (alpha: number) => toRgba(color, alpha);

    // Configure series based on type
    switch (type) {
      case 'line':
        option.series = [{
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          lineStyle: {
            color: color,
            width: 2,
          },
        }];
        break;

      case 'area':
        option.series = [{
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          lineStyle: {
            color: color,
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: toRgba(color, 0.25) },
              { offset: 1, color: toRgba(color, 0.02) },
            ]),
          },
        }];
        break;

      case 'bar':
        option.series = [{
          type: 'bar',
          data: data,
          barWidth: '60%',
          itemStyle: {
            color: rgba(0.2),
            borderColor: rgba(0.9),
            borderWidth: 1,
            borderRadius: [2, 2, 0, 0],
          },
        }];
        break;
    }

    chartInstance.setOption(option);

    // Handle resize
    const handleResize = () => { chartInstance?.resize(); };

    window.addEventListener('resize', handleResize);
    
    // Resize after a small delay to ensure container is properly sized
    setTimeout(() => {
      chartInstance?.resize();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartInstance, data, type, color]);

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
    <div 
      ref={chartRef}
      style={{ 
        width: '100%', 
        height: height,
        minHeight: height,
        maxHeight: height,
      }}
    />
  );
};

/**
 * TrendLine Component
 * Line chart with area fill for trend visualization
 */
export const TrendLine: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = 'var(--color-primary)', height = 60 }) => {
  return <StatCardChart type="area" data={data} color={color} height={height} />;
};

/**
 * VolumeBar Component
 * Bar chart for volume visualization
 */
export const VolumeBar: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = 'var(--color-success)', height = 60 }) => {
  return <StatCardChart type="bar" data={data} color={color} height={height} />;
};

/**
 * SimpleLine Component
 * Simple line chart without area fill
 */
export const SimpleLine: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = 'var(--color-info)', height = 60 }) => {
  return <StatCardChart type="line" data={data} color={color} height={height} />;
};

export default StatCardChart;
