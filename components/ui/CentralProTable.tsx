/**
 * Centralized ProTable wrapper
 * Applies shared defaults (responsive scroll, search config) while allowing overrides.
 */

'use client';

import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { useResponsive } from '@/hooks/useResponsive';

// Keep a generic signature so callers can pass <T> without error.
function CentralProTable<
  T extends Record<string, any> = any,
  U = any,
  ValueType = 'text'
>(props: any) {
  const responsive = useResponsive();
  const defaultScroll = responsive.isMobile ? { x: 768 } : { x: 1200 };
  const persistenceKey = props.id ? `protable:${props.id}:columns` : undefined;

  return (
    <ProTable<T, U, ValueType>
      search={{ labelWidth: 'auto', collapseRender: false, ...(props.search as any) }}
      options={{ fullScreen: true, setting: true, reload: true, density: true, ...props.options }}
      columnsState={
        props.columnsState || (persistenceKey ? {
          persistenceKey,
          persistenceType: 'localStorage',
        } : undefined)
      }
      scroll={{ ...defaultScroll, ...(props.scroll || {}) }}
      {...props}
    />
  );
}

export default CentralProTable;
