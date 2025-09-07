/**
 * Centralized Avatar Component
 * Responsive and theme-aware avatar implementation
 */
'use client';

import React from 'react';
import { Avatar, AvatarProps } from 'antd';
import { theme } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

export interface CentralAvatarProps extends AvatarProps {
  responsiveSize?: boolean;
}

const CentralAvatar: React.FC<CentralAvatarProps> = ({
  size,
  responsiveSize = true,
  style,
  ...props
}) => {
  const { token } = theme.useToken();
  const { isMobile, isTablet } = useResponsive();

  // Determine size based on screen size if responsiveSize is enabled
  const getAvatarSize = () => {
    if (!responsiveSize) return size;
    
    if (isMobile) return 32;
    if (isTablet) return 36;
    return size || 40;
  };

  return (
    <Avatar
      size={getAvatarSize()}
      style={{
        backgroundColor: token.colorPrimary,
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    />
  );
};

export default CentralAvatar;