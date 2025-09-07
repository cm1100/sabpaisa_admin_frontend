/**
 * Command Palette
 * Quick navigation (Cmd/Ctrl + K) over app routes.
 */
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Input, List, Space, Typography } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { routes, getFlattenRoutes, RouteConfig } from '@/config/routes';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<any>(null);

  const flat = useMemo<RouteConfig[]>(() => getFlattenRoutes(routes), []);
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = flat
      .filter(r => r.path && r.name)
      .map(r => ({ path: r.path, name: r.name }));
    if (!q) return list.slice(0, 50);
    return list
      .filter(({ name, path }) =>
        name.toLowerCase().includes(q) || path.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [flat, query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus?.(), 0);
    } else {
      setQuery('');
      setHighlight(0);
    }
  }, [open]);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, entries.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      const item = entries[highlight];
      if (item) navigate(item.path);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={600}
      destroyOnClose
      styles={{ body: { paddingTop: 12 } }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input
          ref={inputRef}
          placeholder="Search pages, e.g. transactions, clients, config…"
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Command palette search"
        />

        <List
          dataSource={entries}
          renderItem={(item, idx) => (
            <List.Item
              style={{
                cursor: 'pointer',
                background: idx === highlight ? 'var(--color-primary-alpha-10)' : 'transparent',
                borderRadius: 8,
              }}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => navigate(item.path)}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{item.name}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.path}</Typography.Text>
                </Space>
                <ArrowRightOutlined />
              </Space>
            </List.Item>
          )}
          locale={{ emptyText: 'No results' }}
          style={{ maxHeight: 360, overflow: 'auto' }}
        />

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Tip: Use Cmd/Ctrl + K to open quickly. ↑/↓ to navigate, Enter to open.
        </Typography.Text>
      </Space>
    </Modal>
  );
};

export default CommandPalette;

