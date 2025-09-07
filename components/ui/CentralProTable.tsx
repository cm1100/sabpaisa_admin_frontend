/**
 * Centralized ProTable wrapper
 * Applies shared defaults (responsive scroll, search config) while allowing overrides.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { useResponsive } from '@/hooks/useResponsive';
import { getAllowedColumns } from '@/config/columnPolicy';
import { Segmented } from '@/components/ui';

// Keep a generic signature so callers can pass <T> without error.
function CentralProTable<
  T extends Record<string, any> = any,
  U = any,
  ValueType = 'text'
>(props: any) {
  const responsive = useResponsive();
  const defaultScroll = responsive.isMobile ? { x: 'max-content' as const } : { x: 1200 };
  // Bump persistence key version to avoid stale column states
  const persistenceKey = props.id ? `protable:v2:${props.id}:columns` : undefined;

  // Mobile view mode: compact (policy defaults) or full (show all columns)
  const [mobileViewMode, setMobileViewMode] = useState<'compact' | 'full'>('compact');

  // Apply ColumnPolicy registry when an id is provided, similar to CentralTable
  const resolvedColumns = useMemo(() => {
    const cols = (props.columns || []) as any[];
    if (!props.id || !Array.isArray(cols) || !cols.length) return cols as any;
    try {
      // Apply ColumnPolicy only on mobile to avoid pruning on larger screens
      if (!responsive.isMobile) return cols as any;
      const allowed = getAllowedColumns(props.id, 'xs' as any);
      if (!allowed || !allowed.length) return cols as any;
      // Do not remove columns; hide them by default so users can re-enable via settings
      return cols.map((c, idx) => {
        const key = String(c.key ?? c.dataIndex ?? idx);
        return {
          ...c,
          key,
          // Remove fixed columns on mobile to allow free horizontal scroll
          fixed: undefined,
          hideInTable: mobileViewMode === 'compact' ? (!allowed.includes(key) || c.hideInTable === true) : false,
        };
      });
    } catch {
      return cols as any;
    }
  }, [props.columns, props.id, responsive.isMobile, responsive.isTablet, mobileViewMode]);

  // Compose toolBarRender to inject view mode switch on mobile
  const composedToolBar = (action: any, rows: any) => {
    const orig = typeof props.toolBarRender === 'function' ? props.toolBarRender(action, rows) : props.toolBarRender;
    const items = Array.isArray(orig) ? orig : (orig ? [orig] : []);
    if (!responsive.isMobile) return items;
    return [
      <Segmented
        key="view-mode"
        options={[{ label: 'Compact', value: 'compact' }, { label: 'Full', value: 'full' }]}
        value={mobileViewMode}
        onChange={(v: any) => setMobileViewMode(v)}
      />,
      ...items,
    ];
  };

  return (
    <ProTable<T, U, ValueType>
      {...props}
      search={{ labelWidth: 'auto', collapseRender: false, ...(props.search as any) }}
      options={{ fullScreen: true, setting: true, reload: true, density: true, ...props.options }}
      columnsState={
        props.columnsState || (persistenceKey ? {
          persistenceKey,
          persistenceType: 'localStorage',
        } : undefined)
      }
      scroll={{ ...defaultScroll, ...(props.scroll || {}) }}
      columns={resolvedColumns as any}
      toolBarRender={composedToolBar as any}
    />
  );
}

export default CentralProTable;
