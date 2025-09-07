/**
 * FilterDrawer
 * Mobile-first filter container: renders a Filters button that opens a bottom drawer.
 * Desktop consumers can continue rendering inline filters; use this only on mobile.
 */
'use client';

import React, { useState } from 'react';
import { Drawer } from 'antd';
import { CentralButton, CentralBadge, StyledSpace } from '@/components/ui';
import { FilterOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

interface FilterDrawerProps {
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  count?: number; // optional active filter count
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  title = 'Filters',
  children,
  onApply,
  onClear,
  count,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CentralButton
        icon={<FilterOutlined />}
        onClick={() => setOpen(true)}
        aria-label="Open filters"
      >
        Filters {typeof count === 'number' && <CentralBadge count={count} />}
      </CentralButton>

      <Drawer
        placement="bottom"
        height="80vh"
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <div style={{ paddingBottom: 12 }}>{children}</div>
        <StyledSpace style={{ position: 'sticky', bottom: 0, paddingTop: 8 }}>
          {onClear && (
            <CentralButton onClick={onClear} icon={<DeleteOutlined />}>Clear</CentralButton>
          )}
          {onApply && (
            <CentralButton type="primary" onClick={() => { onApply(); setOpen(false); }} icon={<CheckOutlined />}>Apply</CentralButton>
          )}
        </StyledSpace>
      </Drawer>
    </>
  );
};

export default FilterDrawer;

