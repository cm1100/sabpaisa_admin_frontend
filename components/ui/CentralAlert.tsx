/**
 * Centralized Alert Component
 * Fully responsive with theme integration
 */

'use client';

import React from 'react';
import { Alert, AlertProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';

interface CentralAlertProps extends AlertProps {
  responsive?: boolean;
}

export const CentralAlert: React.FC<CentralAlertProps> = ({
  responsive = true,
  ...props
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <Alert
      {...props}
      style={{
        marginBottom: isMobile ? 12 : 16,
      }}
    />
  );
};

export default CentralAlert;