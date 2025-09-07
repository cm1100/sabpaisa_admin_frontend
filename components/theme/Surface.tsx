/**
 * Surface component
 * Defines visual surfaces and scopes text color + AntD tokens appropriately.
 */
'use client';

import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

type SurfaceType = 'default' | 'primary' | 'gradient' | 'banner';

interface SurfaceProps {
  type?: SurfaceType;
  padded?: boolean;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Surface: React.FC<SurfaceProps> = ({
  type = 'default',
  padded = false,
  radius = 0,
  className = '',
  style = {},
  children,
}) => {
  const theme = useTheme();
  const isGradient = type === 'gradient' || type === 'primary';
  const isBanner = type === 'banner';

  const baseClass = isGradient ? 'surface-gradient' : isBanner ? 'surface-banner' : 'surface-default';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  const container = (
    <section
      className={classes}
      style={{
        // Provide a clear background for gradient surfaces; default inherits
        ...(isGradient ? { background: 'var(--color-bg-gradient)' } : {}),
        ...(isBanner ? { background: 'var(--color-bg-banner)' } : {}),
        ...(padded ? { padding: 'var(--spacing-lg)' } : {}),
        ...(radius ? { borderRadius: radius } : {}),
        // Ensure high-contrast text on gradient surfaces
        ...(isGradient ? { color: 'var(--color-text-inverse)' } : {}),
        ...style,
      }}
    >
      {children}
    </section>
  );

  // No nested ConfigProvider; rely on CSS variables and explicit styles above
  return container;
};

export default Surface;
