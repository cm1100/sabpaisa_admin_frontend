/**
 * Premium Card Component with Glassmorphism Design
 * Follows SOLID principles and modern React patterns
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glassEffects, gradients, animations } from '@/styles/theme';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
  hover?: boolean;
  animate?: boolean;
  glow?: boolean;
  gradient?: keyof typeof gradients;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  style = {},
  variant = 'primary',
  hover = true,
  animate = true,
  glow = false,
  gradient,
  onClick,
}) => {
  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...glassEffects.card,
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Add gradient background if specified
    if (gradient) {
      baseStyles.background = gradients[gradient];
      baseStyles.color = 'var(--color-text-inverse)';
    }

    // Add glow effect
    if (glow) {
      const glowColors = {
        primary: 'rgba(var(--color-primary-rgb), 0.3)',
        secondary: 'rgba(0, 0, 0, 0.1)',
        success: 'rgba(var(--color-success-rgb), 0.3)',
        warning: 'rgba(var(--color-warning-rgb), 0.3)',
        info: 'rgba(var(--color-info-rgb), 0.3)',
        danger: 'rgba(var(--color-error-rgb), 0.3)',
      } as const;
      baseStyles.boxShadow = `0 0 30px ${glowColors[variant]}, ${baseStyles.boxShadow || '0 12px 40px var(--shadow-sm)'}`;
    }

    return { ...baseStyles, ...style };
  };

  const hoverStyles = hover ? {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px var(--shadow-md)',
  } : {};

  const CardComponent = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    ...animations.fadeIn,
    whileHover: hover ? hoverStyles : undefined,
    whileTap: onClick ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <CardComponent
      className={className}
      style={getCardStyles()}
      onClick={onClick}
      {...motionProps}
    >
      {/* Animated background shimmer */}
      {animate && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: gradients.shimmer,
            zIndex: 0,
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 2, ease: 'linear' as any, repeat: Infinity }}
        />
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </CardComponent>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'primary',
  className = '',
}) => {
  const variantColors = {
    primary: { gradient: gradients.primary, color: 'var(--color-primary)' },
    success: { gradient: gradients.success, color: 'var(--color-success)' },
    warning: { gradient: gradients.warning, color: 'var(--color-warning)' },
    info: { gradient: gradients.info, color: 'var(--color-info)' },
    danger: { gradient: gradients.danger, color: 'var(--color-error)' },
  };

  return (
    <PremiumCard className={className} hover glow variant={variant}>
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: variantColors[variant].gradient,
      }} />
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
      }}>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {title}
        </span>
        <div style={{
          background: variantColors[variant].gradient,
          padding: 8,
          borderRadius: 12,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 40,
          minHeight: 40,
        }}>
          {icon}
        </div>
      </div>
      
      {/* Value */}
      <div style={{ paddingLeft: 24, paddingRight: 24, marginBottom: 16 }}>
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {value}
        </div>
        {subtitle && (
          <span style={{
            fontSize: 16,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}>
            {subtitle}
          </span>
        )}
      </div>
      
      {/* Trend */}
      {trend && (
        <div style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            background: trend.isPositive ? 'var(--color-success-alpha-20)' : 'var(--color-error-alpha-20)',
            color: trend.isPositive ? 'var(--color-success-dark)' : 'var(--color-error)',
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            {trend.label || 'vs yesterday'}
          </span>
        </div>
      )}
    </PremiumCard>
  );
};

export default PremiumCard;
