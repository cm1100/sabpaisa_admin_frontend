/**
 * Centralized Space Component
 * Uses Ant Design's Space with theme tokens for consistent spacing
 */

'use client';

import React from 'react';
import { Space, SpaceProps, Flex, theme } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

type AllowedSizes = 'compact' | 'normal' | 'spacious' | 'small' | 'middle' | 'large' | number;

interface StyledSpaceProps extends Omit<SpaceProps, 'size'> {
  children: React.ReactNode;
  size?: AllowedSizes;
  fullWidth?: boolean;
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
}

export const StyledSpace: React.FC<StyledSpaceProps> = ({
  children,
  size = 'normal',
  fullWidth = false,
  direction = 'horizontal',
  justify,
  alignItems,
  ...props
}) => {
  const { token } = theme.useToken();
  const responsive = useResponsive();

  // Calculate size based on theme tokens and responsiveness
  const getSpaceSize = () => {
    if (typeof size === 'number') return size;
    if (size === 'small') return responsive.isMobile ? token.marginXS : token.marginSM;
    if (size === 'middle') return token.margin;
    if (size === 'large') return token.marginLG;
    
    if (responsive.isMobile) {
      switch (size) {
        case 'compact': return token.marginXS;
        case 'spacious': return token.marginLG;
        default: return token.marginSM;
      }
    }
    
    switch (size) {
      case 'compact': return token.marginSM;
      case 'spacious': return token.marginXL;
      default: return token.margin;
    }
  };

  // If justify or alignItems is needed, use Flex component
  if (justify || alignItems || fullWidth) {
    return (
      <Flex
        justify={justify}
        align={alignItems}
        style={{ 
          width: fullWidth ? '100%' : undefined,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        gap={getSpaceSize()}
        wrap={props.wrap !== undefined ? props.wrap : responsive.isMobile}
      >
        {children}
      </Flex>
    );
  }

  // Otherwise use Space component
  return (
    <Space
      {...props}
      direction={direction}
      size={getSpaceSize()}
      wrap={props.wrap !== undefined ? props.wrap : responsive.isMobile}
      style={{
        maxWidth: '100%',
        ...props.style
      }}
    >
      {children}
    </Space>
  );
};

export default StyledSpace;
