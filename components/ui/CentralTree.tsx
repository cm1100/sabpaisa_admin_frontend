/**
 * Centralized Tree Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Tree, TreeProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

interface CentralTreeProps extends TreeProps {
  responsive?: boolean;
}

export const CentralTree: React.FC<CentralTreeProps> = ({
  responsive = true,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Responsive behavior adjustments
  const getResponsiveProps = () => {
    if (!responsive) return {};
    
    const responsiveProps: Partial<TreeProps> = {};
    
    // On mobile, use smaller checkboxes and reduce padding
    if (isMobile) {
      responsiveProps.blockNode = true;
    }
    
    return responsiveProps;
  };

  return (
    <Tree
      {...props}
      {...getResponsiveProps()}
    />
  );
};

export default CentralTree;