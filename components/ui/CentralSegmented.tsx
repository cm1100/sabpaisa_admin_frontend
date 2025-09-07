/**
 * Centralized Segmented Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Segmented, SegmentedProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

interface CentralSegmentedProps extends SegmentedProps {
  responsive?: boolean;
  mobileOptions?: SegmentedProps['options']; // Simplified options for mobile
}

export const CentralSegmented: React.FC<CentralSegmentedProps> = ({
  responsive = true,
  options,
  mobileOptions,
  size,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Use mobile options if provided and on mobile
  const getOptions = () => {
    if (responsive && isMobile && mobileOptions) {
      return mobileOptions;
    }
    return options;
  };
  
  // Responsive size
  const getSize = () => {
    if (size) return size;
    if (!responsive) return 'middle';
    if (isMobile) return 'small';
    return 'middle';
  };

  return (
    <Segmented
      {...props}
      options={getOptions()}
      size={getSize()}
    />
  );
};

export default CentralSegmented;