/**
 * MobileDetailDrawer
 * Bottom drawer for showing record details on mobile.
 */
'use client';

import React from 'react';
import { Drawer } from 'antd';

interface MobileDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
}

const MobileDetailDrawer: React.FC<MobileDetailDrawerProps> = ({
  open,
  onClose,
  title = 'Details',
  children,
  height = '80vh',
}) => {
  return (
    <Drawer
      placement="bottom"
      height={height}
      title={title}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {children}
    </Drawer>
  );
};

export default MobileDetailDrawer;

