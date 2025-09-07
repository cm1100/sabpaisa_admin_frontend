/**
 * Centralized Table Component
 * Responsive table with optional column controls and sticky header.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table, Dropdown, Menu, Space, Button, Checkbox } from '@/components/ui';
import type { TableProps } from 'antd';
import { useResponsive } from '@/hooks/useResponsive';
import { getAllowedColumns } from '@/config/columnPolicy';

interface CentralTableProps<T = any> extends TableProps<T> {
  responsive?: boolean;
  id?: string; // persistence key for column visibility
  enableColumnControls?: boolean;
  stickyHeader?: boolean;
  // Fallback index signature to avoid consumer type friction
  [key: string]: any;
}

export function CentralTable<T extends object = any>({
  responsive = true,
  scroll,
  pagination,
  size,
  id,
  columns,
  enableColumnControls = false,
  stickyHeader = true,
  ...props
}: CentralTableProps<T>) {
  const { isMobile, isTablet } = useResponsive();
  // Add a version segment to reset old persisted visibility states
  const storageKey = id ? `central-table:v2:${id}:columns` : undefined;
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});
  const [pinMap, setPinMap] = useState<Record<string, 'left' | 'right' | undefined>>({});

  // Responsive configuration with better overflow handling
  const getScroll = () => {
    if (scroll) return scroll;
    if (responsive) {
      if (isMobile) return { x: 768 };
      if (isTablet) return { x: 992 };
    }
    return { x: 'max-content' };
  };

  const getPagination = () => {
    if (pagination === false) return false;
    if (responsive && isMobile) {
      // Cast to avoid TS overly strict inference on pagination config merging
      return {
        ...((typeof pagination === 'object' ? pagination : {})),
        simple: true,
        size: 'small',
      } as any;
    }
    return pagination;
  };

  const getSize = () => {
    if (size) return size;
    return responsive && isMobile ? 'small' : 'middle';
  };

  // Build initial visibility map from columns
  useEffect(() => {
    if (!columns) return;
    const next: Record<string, boolean> = {};
    const nextPin: Record<string, 'left' | 'right' | undefined> = {};
    columns.forEach((col: any, idx: number) => {
      const key = String(col.key ?? col.dataIndex ?? idx);
      next[key] = true;
      if (col.fixed === 'left' || col.fixed === 'right') nextPin[key] = col.fixed;
    });
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (saved && saved.visibleMap) Object.assign(next, saved.visibleMap);
        if (saved && saved.pinMap) Object.assign(nextPin, saved.pinMap);
      } catch {}
    }
    setVisibleMap(next);
    setPinMap(nextPin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on changes
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ visibleMap, pinMap }));
    } catch {}
  }, [storageKey, visibleMap, pinMap]);

  const controlledColumns = useMemo(() => {
    if (!columns) return columns as any;
    let result = (columns as any[])
      .map((col, idx) => {
        const key = String(col.key ?? col.dataIndex ?? idx);
        const fixed = pinMap[key];
        return { ...col, key, fixed };
      })
      .filter((col, idx) => {
        const key = String(col.key ?? col.dataIndex ?? idx);
        return visibleMap[key] !== false;
      });

    // Apply ColumnPolicy registry automatically when an id is provided
    try {
      // Apply ColumnPolicy only on mobile (xs) to avoid unintended pruning
      if (id && isMobile) {
        const allowed = getAllowedColumns(id, 'xs');
        if (allowed && allowed.length) {
          result = result.filter((c: any, idx: number) => {
            const key = String(c.key ?? c.dataIndex ?? idx);
            return allowed.includes(key);
          });
        }
      }
    } catch {}
    return result as any;
  }, [columns, visibleMap, pinMap, id, isMobile, isTablet]);

  const columnMenu = useMemo(() => {
    if (!columns) return null;
    const items = (columns as any[]).map((col, idx) => {
      const key = String(col.key ?? col.dataIndex ?? idx);
      const title = col.title ?? key;
      const checked = visibleMap[key] !== false;
      const pinned = pinMap[key];
      return {
        key,
        label: (
          <Space size={8} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Checkbox
              checked={checked}
              onChange={(e) => setVisibleMap((m) => ({ ...m, [key]: e.target.checked }))}
            >
              {title}
            </Checkbox>
            <Space size={4}>
              <Button
                size="small"
                type={pinned === 'left' ? 'primary' : 'default'}
                onClick={(e) => {
                  e.stopPropagation();
                  setPinMap((m) => ({ ...m, [key]: m[key] === 'left' ? undefined : 'left' }));
                }}
              >
                Pin L
              </Button>
              <Button
                size="small"
                type={pinned === 'right' ? 'primary' : 'default'}
                onClick={(e) => {
                  e.stopPropagation();
                  setPinMap((m) => ({ ...m, [key]: m[key] === 'right' ? undefined : 'right' }));
                }}
              >
                Pin R
              </Button>
            </Space>
          </Space>
        ),
      };
    });
    return <Menu items={items} />;
  }, [columns, visibleMap, pinMap]);

  return (
    <div style={{ width: '100%' }}>
      {enableColumnControls && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Dropdown overlay={columnMenu} trigger={["click"]}>
            <Button size={isMobile ? 'small' : 'middle'} aria-label="Table column controls">
              Columns
            </Button>
          </Dropdown>
        </div>
      )}
      <Table<T>
        {...props}
        columns={controlledColumns as any}
        sticky={stickyHeader as any}
        scroll={getScroll()}
        pagination={getPagination()}
        size={getSize()}
      />
    </div>
  );
}

export default CentralTable;
