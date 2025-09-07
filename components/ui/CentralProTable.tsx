/**
 * Centralized ProTable wrapper
 * Applies shared defaults (responsive scroll, search config) while allowing overrides.
 */

'use client';

import React, { useMemo } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { useResponsive } from '@/hooks/useResponsive';
import { getAllowedColumns } from '@/config/columnPolicy';

// Keep a generic signature so callers can pass <T> without error.
function CentralProTable<
  T extends Record<string, any> = any,
  U = any,
  ValueType = 'text'
>(props: any) {
  const responsive = useResponsive();
  const defaultScroll = responsive.isMobile ? { x: 768 } : { x: 1200 };
  // Bump persistence key version to avoid stale column states
  const persistenceKey = props.id ? `protable:v2:${props.id}:columns` : undefined;

  // Apply ColumnPolicy registry when an id is provided, similar to CentralTable
  const resolvedColumns = useMemo(() => {
    const cols = (props.columns || []) as any[];
    if (!props.id || !Array.isArray(cols) || !cols.length) return cols as any;
    try {
      // Apply ColumnPolicy only on mobile to avoid pruning on tablets/desktops
      if (!responsive.isMobile) return cols as any;
      const bp = 'xs';
      const allowed = getAllowedColumns(props.id, bp as any);
      if (!allowed || !allowed.length) return cols as any;
      return cols
        .map((c, idx) => ({ ...c, key: String(c.key ?? c.dataIndex ?? idx) }))
        .filter((c, idx) => allowed.includes(String(c.key ?? c.dataIndex ?? idx)));
    } catch {
      return cols as any;
    }
  }, [props.columns, props.id, responsive.isMobile, responsive.isTablet]);

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
    />
  );
}

export default CentralProTable;
