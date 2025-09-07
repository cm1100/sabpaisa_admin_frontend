/**
 * Centralized Button Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

interface CentralButtonProps extends ButtonProps {
  children?: React.ReactNode;
  responsive?: boolean;
  gradient?: boolean; // use primary gradient background
}

export const CentralButton: React.FC<CentralButtonProps> = ({
  children,
  responsive = true,
  gradient = false,
  size,
  icon,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Responsive size handling
  const getSize = () => {
    if (size) return size;
    if (!responsive) return 'middle';
    if (isMobile) return 'small';
    if (isTablet) return 'middle';
    return 'middle';
  };
  
  // Hide text on mobile for icon buttons
  const getChildren = () => {
    if (responsive && isMobile && icon && typeof children === 'string') {
      return null; // Show only icon on mobile
    }
    return children;
  };

  const style: React.CSSProperties = {
    ...(props.style as React.CSSProperties),
    ...(gradient && {
      background: 'var(--color-gradient-primary)',
      color: 'var(--color-text-inverse)',
      border: 'none',
    }),
  };

  return (
    <Button {...props} icon={icon} size={getSize()} style={style}>
      {getChildren()}
    </Button>
  );
};

export default CentralButton;
