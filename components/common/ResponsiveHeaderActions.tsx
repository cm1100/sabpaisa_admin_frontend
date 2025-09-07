/**
 * ResponsiveHeaderActions
 * A centralized, mobile-aware header actions renderer.
 * - On mobile: shows minimal primary actions and collapses the rest into a More dropdown
 * - On desktop: renders all actions inline with optional range control
 */
'use client';

import React from 'react';
import { StyledSpace, CentralButton, Tooltip, Dropdown } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';

export interface HeaderActionItem {
  key: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface RangeControl {
  value: string;
  onChange: (val: string) => void;
  options: { label: React.ReactNode; value: string }[];
  Segmented: React.ComponentType<any>; // pass CentralSegmented
}

interface ResponsiveHeaderActionsProps {
  primary?: HeaderActionItem[];     // always visible (e.g., refresh)
  secondary?: HeaderActionItem[];   // collapses into More on mobile
  range?: RangeControl;             // optional segmented range control
  moreLabel?: React.ReactNode;      // label for More button (mobile)
}

const ResponsiveHeaderActions: React.FC<ResponsiveHeaderActionsProps> = ({
  primary = [],
  secondary = [],
  range,
  moreLabel = 'More',
}) => {
  const { isMobile } = useResponsive();

  const renderButton = (a: HeaderActionItem, size: 'small' | 'middle' = 'middle') => (
    <Tooltip key={a.key} title={typeof a.label === 'string' ? a.label : undefined}>
      <CentralButton
        aria-label={typeof a.label === 'string' ? a.label : a.key}
        icon={a.icon}
        disabled={a.disabled}
        onClick={a.onClick}
        size={size}
      >
        {!isMobile && a.label}
      </CentralButton>
    </Tooltip>
  );

  if (isMobile) {
    const menuItems = [
      ...(range ? [{
        key: 'range',
        label: (
          <range.Segmented
            options={range.options}
            value={range.value}
            onChange={(v: string) => range.onChange(v)}
          />
        )
      }] : []),
      ...secondary.map(a => ({ key: a.key, label: a.label, disabled: a.disabled, onClick: a.onClick, icon: a.icon })),
    ];

    return (
      <StyledSpace size="small" wrap>
        {primary.map(a => renderButton(a, 'small'))}
        {menuItems.length > 0 && (
          <Dropdown menu={{ items: menuItems.map(i => ({ ...i, onClick: i.onClick ? () => i.onClick!() : undefined })) }}>
            <CentralButton size="small">{moreLabel}</CentralButton>
          </Dropdown>
        )}
      </StyledSpace>
    );
  }

  return (
    <StyledSpace size="small" wrap>
      {range && (
        <range.Segmented
          options={range.options}
          value={range.value}
          onChange={(v: string) => range.onChange(v)}
        />
      )}
      {primary.map(a => renderButton(a))}
      {secondary.map(a => renderButton(a))}
    </StyledSpace>
  );
};

export default ResponsiveHeaderActions;

