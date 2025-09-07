/**
 * Centralized TextArea Component
 * Wraps Ant Design Input.TextArea with responsive defaults
 */

'use client';

import React from 'react';
import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import { theme } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

export interface CentralTextAreaProps extends TextAreaProps {
  size?: 'small' | 'middle' | 'large';
}

const CentralTextArea: React.FC<CentralTextAreaProps> = ({ size = 'middle', style, ...props }) => {
  const { token } = theme.useToken();
  const responsive = useResponsive();
  const computedSize = responsive.isMobile ? 'small' : size;

  return (
    <Input.TextArea
      {...props}
      size={computedSize as any}
      style={{
        ...style,
        fontSize: computedSize === 'small' ? 12 : 14,
        borderRadius: token.borderRadius,
      }}
      autoSize={{ minRows: computedSize === 'small' ? 2 : 3, maxRows: 8 }}
    />
  );
};

export default CentralTextArea;

