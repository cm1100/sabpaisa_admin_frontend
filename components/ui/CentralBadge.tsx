/**
 * Centralized Badge Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Badge, BadgeProps } from 'antd';
import { theme } from 'antd';

interface CentralBadgeProps extends BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'processing';
}

export const CentralBadge: React.FC<CentralBadgeProps> = ({
  variant = 'default',
  color,
  ...props
}) => {
  const { token } = theme.useToken();
  
  // Use theme tokens for colors
  const getColor = () => {
    if (color) return color;
    switch (variant) {
      case 'success': return token.colorSuccess;
      case 'error': return token.colorError;
      case 'warning': return token.colorWarning;
      case 'processing': return token.colorPrimary;
      default: return undefined;
    }
  };

  return (
    <Badge
      {...props}
      color={getColor()}
    />
  );
};

export default CentralBadge;