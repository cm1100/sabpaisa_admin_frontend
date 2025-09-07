/**
 * Responsive Chart Wrapper Component
 * Implements SOLID principles - Single Responsibility & Open/Closed
 * Handles responsive behavior for all chart types
 */
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
// Relaxed typing to avoid bundler/namespace type issues in different TS configs
type EChartsOption = any;
import { useResponsive, Breakpoint } from '@/hooks/useResponsive';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Spin } from '@/components/ui';
import { LoadingOutlined } from '@ant-design/icons';

interface ResponsiveChartProps {
  option: EChartsOption;
  height?: number | Partial<Record<Breakpoint, number>>;
  minHeight?: number;
  maxHeight?: number;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
  renderer?: 'canvas' | 'svg';
  onReady?: (chart: any) => void;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  showLoading?: boolean;
}

/**
 * ResponsiveChart Component
 * Automatically handles resize events and adjusts chart dimensions
 * Uses ResizeObserver for optimal performance
 */
export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  option,
  height = { xs: 200, sm: 250, md: 300, lg: 350, xl: 400 },
  minHeight = 150,
  maxHeight = 600,
  loading = false,
  className = '',
  style = {},
  theme = 'light',
  renderer = 'canvas', // Canvas is better for performance with large datasets
  onReady,
  notMerge = false,
  lazyUpdate = true,
  showLoading = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isClient, setIsClient] = useState(false);
  const responsive = useResponsive(containerRef);
  const themeCtx = useTheme();
  const echartsTheme = themeCtx?.isDark ? 'dark' : 'light';

  // Calculate responsive height
  const currentHeight = useMemo(() => {
    if (typeof height === 'number') return height;
    
    // Get height for current breakpoint with fallback
    const breakpointHeight = height[responsive.breakpoint] || 
                            height.lg || 
                            height.md || 
                            height.sm || 
                            height.xs || 
                            300;
    
    // Apply min/max constraints
    return Math.min(Math.max(breakpointHeight, minHeight), maxHeight);
  }, [height, responsive.breakpoint, minHeight, maxHeight]);

  // Responsive adjustments to chart options
  const responsiveOption = useMemo(() => {
    const baseOption: any = { ...option };
    // Provide a theme-aware default palette
    baseOption.color = baseOption.color || [
      'var(--app-colorPrimary)',
      'var(--app-colorSuccess)',
      'var(--app-colorWarning)',
      'var(--app-colorInfo)',
      'var(--app-colorError)'
    ];
    // Global text style for better dark-mode contrast
    baseOption.textStyle = {
      ...(baseOption.textStyle || {}),
      color: 'var(--app-colorText)'
    };
    // Normalize axis styles (x + y) to token-based colors
    const ensureAxisStyles = (axis: any) => {
      if (!axis) return axis;
      const apply = (ax: any) => ({
        ...(ax || {}),
        axisLabel: {
          ...(ax?.axisLabel || {}),
          color: ax?.axisLabel?.color || 'var(--app-colorTextSecondary)'
        },
        axisLine: {
          ...(ax?.axisLine || {}),
          lineStyle: {
            ...(ax?.axisLine?.lineStyle || {}),
            color: ax?.axisLine?.lineStyle?.color || 'var(--app-colorBorder)'
          }
        },
        splitLine: ax?.splitLine === undefined ? {
          show: true,
          lineStyle: { color: 'var(--app-colorSplit)' }
        } : ax.splitLine,
      });
      return Array.isArray(axis) ? axis.map(apply) : apply(axis);
    };
    baseOption.xAxis = ensureAxisStyles(baseOption.xAxis);
    baseOption.yAxis = ensureAxisStyles(baseOption.yAxis);
    // Ensure tooltip is readable on current surface
    baseOption.tooltip = {
      ...(baseOption.tooltip || {}),
      backgroundColor: (baseOption.tooltip || {}).backgroundColor || 'var(--app-colorBgElevated)',
      borderColor: (baseOption.tooltip || {}).borderColor || 'var(--app-colorBorder)',
      textStyle: {
        ...((baseOption.tooltip || {}).textStyle || {}),
        color: 'var(--app-colorText)'
      }
    };
    
    // Adjust font sizes for mobile
    if (responsive.isMobile) {
      // Reduce title font size
      if (baseOption.title) {
        baseOption.title = {
          ...baseOption.title,
          textStyle: {
            ...(baseOption.title as any)?.textStyle,
            fontSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size-14')) || 14
          }
        };
      }
      
      // Adjust legend for mobile
      if (baseOption.legend) {
        baseOption.legend = {
          ...baseOption.legend,
          orient: 'horizontal',
          bottom: 0,
          itemWidth: 20,
          itemHeight: 10,
          textStyle: {
            fontSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size-10')) || 10
          }
        };
      }
      
      // Adjust grid for mobile
      if (baseOption.grid) {
        baseOption.grid = {
          ...baseOption.grid,
          left: '3%',
          right: '3%',
          bottom: '12%',
          top: '10%'
        };
      }
      
      // Rotate x-axis labels for better mobile display
      if (baseOption.xAxis && !Array.isArray(baseOption.xAxis)) {
        baseOption.xAxis = {
          ...baseOption.xAxis,
          axisLabel: {
            ...(baseOption.xAxis as any)?.axisLabel,
            rotate: 45,
            fontSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size-10')) || 10
          }
        };
      }
    }
    
    // Tablet adjustments
    if (responsive.isTablet) {
      if (baseOption.title) {
        baseOption.title = {
          ...baseOption.title,
          textStyle: {
            ...(baseOption.title as any)?.textStyle,
            fontSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size-16')) || 15
          }
        };
      }
      
      if (baseOption.grid) {
        baseOption.grid = {
          ...baseOption.grid,
          left: '4%',
          right: '4%',
          bottom: '10%',
          top: '12%'
        };
      }
    }
    
    // Adjust tooltip for touch devices
    if (responsive.isMobile || responsive.isTablet) {
      baseOption.tooltip = {
        ...baseOption.tooltip,
        trigger: 'axis',
        confine: true, // Keep tooltip within container
        position: function(point: number[], params: any, dom: any, rect: any, size: any) {
          // Position tooltip to avoid going off-screen
          const x = point[0] < size.viewSize[0] / 2 ? point[0] : point[0] - size.contentSize[0];
          const y = point[1] < size.viewSize[1] / 2 ? point[1] : point[1] - size.contentSize[1];
          return [x, y];
        }
      };
    }
    
    return baseOption;
  }, [option, responsive]);

  // Handle chart resize
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let localObserver: ResizeObserver | null = null;
    if (!containerRef.current || !chartRef.current) return () => {};
    
    const chartInstance = chartRef.current?.getEchartsInstance?.();
    if (!chartInstance) return () => {};
    
    // Create ResizeObserver for container
    localObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      
      // Get current chart instance again in case it changed
      const currentChartInstance = chartRef.current?.getEchartsInstance?.();
      if (!currentChartInstance) return;
      
      // Check if size actually changed to avoid unnecessary resizes
      const { width, height } = entry.contentRect;
      const currentWidth = currentChartInstance.getWidth?.() || 0;
      const currentHeight = currentChartInstance.getHeight?.() || 0;
      
      if (Math.abs(width - currentWidth) > 1 || Math.abs(height - currentHeight) > 1) {
        // Use requestAnimationFrame for smooth resize
        requestAnimationFrame(() => {
          // Double-check chart instance is still valid
          const resizeChartInstance = chartRef.current?.getEchartsInstance?.();
          if (resizeChartInstance && typeof resizeChartInstance.resize === 'function') {
            resizeChartInstance.resize({
              animation: {
                duration: 300,
                easing: 'cubicOut'
              }
            });
          }
        });
      }
    });
    
    localObserver.observe(containerRef.current);
    
    return () => {
      if (localObserver) {
        localObserver.disconnect();
      }
    };
  }, [isClient]);

  // Handle chart ready event
  const handleChartReady = (chart: any) => {
    chartRef.current = chart;
    if (onReady) {
      onReady(chart);
    }
  };

  if (!isClient) {
    // SSR fallback
    return (
      <div 
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: typeof height === 'number' ? height : 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`responsive-chart-container ${className}`}
      style={{
        width: '100%',
        height: currentHeight,
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--app-colorText)',
        isolation: 'isolate',
        ...style
      }}
    >
      {loading && showLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--glass-bg-secondary)',
          zIndex: 10
        }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      )}
      
      <ReactECharts
        ref={chartRef}
        option={responsiveOption}
        style={{ width: '100%', height: '100%' }}
        opts={{ 
          renderer,
          devicePixelRatio: window.devicePixelRatio || 1
        }}
        theme={theme || echartsTheme}
        onChartReady={handleChartReady}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        showLoading={false}
      />
    </div>
  );
};

export default ResponsiveChart;
