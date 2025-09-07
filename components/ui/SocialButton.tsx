/**
 * Centralized Social Button
 * Brand-aware button that uses CSS variables for colors
 */
'use client';

import React from 'react';
import { CentralButton } from './CentralButton';
import { GoogleOutlined } from '@ant-design/icons';

type Provider = 'google';

interface SocialButtonProps {
  provider: Provider;
  children?: React.ReactNode;
  block?: boolean;
  size?: 'small' | 'middle' | 'large';
  onClick?: () => void | Promise<void>;
}

const iconMap: Record<Provider, React.ReactNode> = {
  google: <GoogleOutlined />,
};

const varMap: Record<Provider, { color: string; hover?: string }> = {
  google: { color: 'var(--color-brand-google)' },
};

const SocialButton: React.FC<SocialButtonProps> = ({ provider, children, block = true, size = 'large', onClick }) => {
  const vars = varMap[provider];
  return (
    <CentralButton
      block={block}
      size={size}
      icon={iconMap[provider]}
      style={{
        height: 48,
        color: vars.color,
        borderColor: vars.color,
        background: 'transparent',
      }}
      onClick={onClick}
    >
      {children}
    </CentralButton>
  );
};

export default SocialButton;

