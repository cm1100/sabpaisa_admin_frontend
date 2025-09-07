/**
 * Success Rate Gauge Component
 * Implements SOLID principles
 * Single Responsibility: Only displays success rate as a gauge
 */
'use client';

import React, { useMemo } from 'react';
import { CentralProgress } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';

interface SuccessRateGaugeProps {
  value: number;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * Success Rate Gauge Component
 * Displays success rate as a circular gauge with color gradient
 * Follows Single Responsibility Principle
 */
export const SuccessRateGauge: React.FC<SuccessRateGaugeProps> = ({
  value = 0,
  height = 60,
  showLabel = true,
  className = '',
}) => {
  const { isMobile } = useResponsive();
  
  // Calculate gauge size based on container height and device
  const gaugeSize = useMemo(() => {
    if (isMobile) {
      return Math.min(height * 1.2, 80);
    }
    return Math.min(height * 1.5, 100);
  }, [height, isMobile]);
  
  // Format the value to 2 decimal places
  const formattedValue = useMemo(() => {
    return Math.min(100, Math.max(0, parseFloat(value.toFixed(2))));
  }, [value]);
  
  // Determine color based on value
  const getStrokeColor = () => {
    if (formattedValue >= 95) return 'var(--color-success)';
    if (formattedValue >= 90) return 'var(--color-success)';
    if (formattedValue >= 80) return 'var(--color-warning)';
    return 'var(--color-error)';
  };
  
  // Custom format function
  const formatPercent = (percent?: number) => {
    if (!showLabel) return '';
    return `${percent?.toFixed(1)}%`;
  };
  
  return (
    <div 
      className={`success-rate-gauge ${className}`}
      style={{ 
        width: '100%', 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <CentralProgress
        type="dashboard"
        percent={formattedValue}
        size={gaugeSize}
        strokeColor={getStrokeColor()}
        strokeWidth={isMobile ? 6 : 8}
        gapDegree={30}
        format={formatPercent}
        style={{
          fontSize: isMobile ? '12px' : '14px',
        }}
      />
    </div>
  );
};

/**
 * Success Rate Card Component
 * Composition over inheritance - uses SuccessRateGauge
 */
interface SuccessRateCardProps {
  value: number;
  trend?: number;
  height?: number;
}

export const SuccessRateCard: React.FC<SuccessRateCardProps> = ({
  value,
  trend,
  height = 100,
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '8px',
    }}>
      <SuccessRateGauge 
        value={value} 
        height={height}
        showLabel={!isMobile}
      />
      
      {/* Value display for mobile */}
      {isMobile && (
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: value >= 90 ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          {value.toFixed(2)}%
        </div>
      )}
      
      {/* Trend indicator */}
      {trend !== undefined && (
        <div style={{
          fontSize: isMobile ? '10px' : '12px',
          color: trend > 0 ? 'var(--color-success)' : 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {trend > 0 ? '↑' : '↓'}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default SuccessRateGauge;
