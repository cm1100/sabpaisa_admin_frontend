/**
 * Centralized Tag Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Tag, TagProps } from 'antd';
import { theme } from 'antd';

interface CentralTagProps extends TagProps {
  variant?: 'success' | 'error' | 'warning' | 'processing' | 'default';
  size?: 'small' | 'middle' | 'large';
}

export const CentralTag: React.FC<CentralTagProps> = ({
  variant = 'default',
  color,
  size = 'middle',
  ...props
}) => {
  const { token } = theme.useToken();
  
  // Normalize color names to AntD preset status colors to centralize visuals
  const normalizeColor = (c?: TagProps['color']) => {
    if (!c) return undefined;
    const val = String(c).toLowerCase();
    const map: Record<string, TagProps['color']> = {
      red: 'error',
      green: 'success',
      orange: 'warning',
      gold: 'warning',
      yellow: 'warning',
      blue: 'processing',
      cyan: 'processing',
      purple: 'processing',
      grey: 'default',
      gray: 'default',
      default: 'default',
      success: 'success',
      error: 'error',
      warning: 'warning',
      processing: 'processing',
    };
    return map[val] ?? c;
  };

  // Use theme tokens for colors
  const getColor = () => {
    const normalized = normalizeColor(color);
    if (normalized) return normalized;
    switch (variant) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'processing': return 'processing';
      default: return 'default';
    }
  };

  const sizeStyle: React.CSSProperties = {
    fontSize: size === 'small' ? 12 : size === 'large' ? 14 : 13,
    paddingInline: size === 'small' ? 6 : size === 'large' ? 10 : 8,
    paddingBlock: size === 'small' ? 0 : size === 'large' ? 2 : 1,
    lineHeight: 1.2,
  };

  return (
    <Tag
      {...props}
      color={getColor()}
      style={{ ...(props.style || {}), ...sizeStyle }}
    />
  );
};

export default CentralTag;
