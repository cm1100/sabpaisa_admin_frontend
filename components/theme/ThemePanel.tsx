/**
 * Theme Panel
 * Drawer UI to control color mode, density, and presets
 */
'use client';

import React from 'react';
import { Drawer, Segmented, Space, Divider, Typography, ColorPicker, Button, Tag } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { themePresets, ThemePresetKey } from '@/styles/themePresets';

interface ThemePanelProps {
  open: boolean;
  onClose: () => void;
}

const ThemePanel: React.FC<ThemePanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { Text, Title, Paragraph } = Typography as any;

  const presetKeys = Object.keys(themePresets) as ThemePresetKey[];

  return (
    <Drawer
      title="Appearance"
      open={open}
      onClose={onClose}
      width={380}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Theme Mode</Title>
          <Segmented
            block
            value={theme.mode}
            onChange={(val) => theme.setMode(val as any)}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'Auto', value: 'system' },
            ]}
          />
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Density</Title>
          <Segmented
            block
            value={theme.density}
            onChange={(val) => theme.setDensity(val as any)}
            options={[
              { label: 'Comfortable', value: 'comfortable' },
              { label: 'Compact', value: 'compact' },
            ]}
          />
          <Paragraph style={{ marginTop: 8, color: 'var(--app-colorTextTertiary)' }}>
            Compact mode fits more data by tightening paddings.
          </Paragraph>
        </div>

        <Divider />

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Presets</Title>
          <Space wrap>
            {presetKeys.map((key) => (
              <Tag
                key={key}
                color={themePresets[key].accent}
                style={{
                  cursor: 'pointer',
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontWeight: 600,
                  opacity: theme.themePreset === key ? 1 : 0.7,
                }}
                onClick={() => theme.setThemePreset(key)}
              >
                {themePresets[key].label}
              </Tag>
            ))}
          </Space>
        </div>

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Accent Color</Title>
          <Space>
            <ColorPicker
              value={theme.accentColor}
              onChange={(c) => theme.setAccentColor(c.toHexString())}
            />
            <Button onClick={() => theme.setAccentColor('#635BFF')}>Reset</Button>
          </Space>
          <Paragraph style={{ marginTop: 8, color: 'var(--app-colorTextTertiary)' }}>
            Accent affects primary buttons, links, selections and highlights.
          </Paragraph>
        </div>
      </Space>
    </Drawer>
  );
};

export default ThemePanel;

