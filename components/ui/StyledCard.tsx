/**
 * Centralized Card Component
 * Uses Ant Design's Card with theme tokens for consistent styling
 */

'use client';

import React from 'react';
import { Card, CardProps, Space, theme } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

type StyledCardVariant = 'default' | 'stat' | 'interactive' | 'bordered' | 'gradient';

interface StyledCardProps extends Omit<CardProps, 'variant'> {
  children: React.ReactNode;
  variant?: StyledCardVariant;
  padding?: 'compact' | 'normal' | 'spacious';
  marginBottom?: boolean;
}

export const StyledCard: React.FC<StyledCardProps> = ({
  children,
  variant = 'default',
  padding = 'normal',
  marginBottom = true,
  ...props
}) => {
  const { token } = theme.useToken();
  const responsive = useResponsive();

  // Use theme tokens for padding
  const getPaddingValue = () => {
    if (responsive.isMobile) {
      switch (padding) {
        case 'compact': return token.paddingXS;
        case 'spacious': return token.paddingLG;
        default: return token.paddingSM;
      }
    }
    switch (padding) {
      case 'compact': return token.paddingSM;
      case 'spacious': return token.paddingXL;
      default: return token.padding;
    }
  };

  // Use theme tokens for styles with responsive adjustments
  const cardStyles: React.CSSProperties = {
    marginBottom: marginBottom ? (responsive.isMobile ? token.marginSM : token.marginMD) : 0,
    borderRadius: token.borderRadius,
    overflow: 'hidden', // Prevent content overflow
    ...(variant === 'interactive' && {
      transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
      cursor: 'pointer',
    }),
    ...(variant === 'bordered' && {
      border: `1px solid ${token.colorBorderSecondary}`,
    }),
    ...(variant === 'gradient' && {
      background: 'linear-gradient(135deg, var(--color-bg-spotlight, var(--color-bg-secondary)), var(--color-bg-elevated))',
      boxShadow: token.boxShadowSecondary,
    })
  };

  const bodyStyle: React.CSSProperties = {
    padding: getPaddingValue(),
  };

  return (
    <Card
      {...props}
      style={{ ...cardStyles, color: token.colorText }}
      styles={{ body: bodyStyle }}
      hoverable={variant === 'interactive'}
      size={responsive.isMobile ? 'small' : 'default'}
    >
      {children}
    </Card>
  );
};

export default StyledCard;
