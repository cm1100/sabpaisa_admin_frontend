/**
 * Centralized Progress Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Progress, ProgressProps } from 'antd';
import { theme } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

interface CentralProgressProps extends ProgressProps {
  variant?: 'success' | 'error' | 'warning' | 'default';
}

export const CentralProgress: React.FC<CentralProgressProps> = ({
  variant = 'default',
  strokeColor,
  ...props
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  
  // Use theme tokens for colors
  const getStrokeColor = () => {
    if (strokeColor) return strokeColor;
    switch (variant) {
      case 'success': return token.colorSuccess;
      case 'error': return token.colorError;
      case 'warning': return token.colorWarning;
      default: return token.colorPrimary;
    }
  };

  return (
    <Progress
      {...props}
      strokeColor={getStrokeColor()}
      size={isMobile ? 'default' : props.size}
    />
  );
};

export default CentralProgress;