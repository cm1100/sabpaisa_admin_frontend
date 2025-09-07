/**
 * Simplified Responsive Grid System for debugging
 */
'use client';

import React from 'react';
import { Row, Col, RowProps, ColProps } from '@/components/ui';

interface SimpleResponsiveColProps extends ColProps {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
  ultraWide?: number;
}

export const SimpleResponsiveCol: React.FC<SimpleResponsiveColProps> = ({
  children,
  mobile = 24,
  tablet = 12,
  desktop = 8,
  wide = 6,
  ultraWide = 4,
  ...restProps
}) => {
  // Direct mapping without any modifications
  return (
    <Col
      xs={mobile}
      sm={mobile}
      md={tablet}
      lg={desktop}
      xl={wide}
      xxl={ultraWide}
      {...restProps}
    >
      {children}
    </Col>
  );
};

export const SimpleResponsiveRow: React.FC<RowProps> = (props) => {
  // Just pass through to Row
  return <Row {...props} />;
};
