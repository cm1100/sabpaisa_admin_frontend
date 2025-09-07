/**
 * Ant Design Configuration Provider
 * Sets up locale and theme configuration for all Ant Design components
 * Following SOLID principles and 2025 best practices
 */

'use client';

import React from 'react';
import { ConfigProvider } from '@/components/ui';
import { theme as antdTheme } from '@/components/ui';
import enUS from 'antd/locale/en_US';
import type { ThemeConfig } from '@/components/ui';

// Suppress React 19 compatibility warning as we have the patch installed
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
      return; // Suppress this specific warning
    }
    originalWarn(...args);
  };
}

// Component-level theme overrides (merged with parent ConfigProvider)
const componentThemeOverrides: ThemeConfig = {
  components: {
    Table: {
      headerBg: 'var(--color-bg-secondary)',
      colorBgContainer: 'var(--color-bg-elevated)',
      colorText: 'var(--color-text-primary)',
      colorTextHeading: 'var(--color-text-primary)',
      rowHoverBg: 'var(--color-bg-tertiary)',
    },
    Card: {
      borderRadiusLG: 12,
      colorBgContainer: 'var(--color-bg-elevated)',
    },
  },
};

/**
 * Interface for provider props
 */
interface AntdConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Ant Design Configuration Provider Component
 * Wraps the application with Ant Design configuration
 */
const AntdConfigProvider: React.FC<AntdConfigProviderProps> = ({ children }) => {
  const { token } = antdTheme.useToken();
  return (
    <ConfigProvider
      locale={enUS}
      theme={componentThemeOverrides}
      componentSize="middle"
      space={{ size: 'middle' }}
      divider={{ style: { marginTop: 16, marginBottom: 16 } }}
      form={{
        requiredMark: true,
        colon: true,
      }}
      table={{
        style: {
          whiteSpace: 'nowrap',
        },
      }}
      // Set empty data text in English
      renderEmpty={() => (
        <div style={{ textAlign: 'center', padding: `${token.paddingLG}px 0`, color: token.colorTextTertiary }}>
          No data available
        </div>
      )}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;
