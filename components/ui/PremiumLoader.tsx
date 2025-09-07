/**
 * Premium Loading Components with Advanced Animations
 * Implements SOLID principles and follows modern React patterns
 */
'use client';

import React from 'react';
import { Spin, Progress } from 'antd';
import { motion } from 'framer-motion';
import { gradients, glassEffects } from '@/styles/theme';

interface PremiumLoaderProps {
  size?: 'small' | 'default' | 'large';
  message?: string;
  progress?: number;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  fullscreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  size = 'default',
  message = 'Loading...',
  progress,
  variant = 'primary',
  fullscreen = false,
  className = '',
  style = {},
}) => {
  const variantGradients = {
    primary: gradients.primary,
    success: gradients.success,
    warning: gradients.warning,
    info: gradients.info,
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: fullscreen ? '0' : '40px',
    ...(fullscreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--glass-bg-primary)',
      backdropFilter: 'blur(20px)',
      zIndex: 9999,
    }),
    ...style,
  };

  const LoadingOrb = () => (
    <motion.div
      style={{
        width: size === 'large' ? '80px' : size === 'small' ? '40px' : '60px',
        height: size === 'large' ? '80px' : size === 'small' ? '40px' : '60px',
        borderRadius: '50%',
        background: variantGradients[variant],
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Inner orb */}
      <motion.div
        style={{
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'var(--glass-bg-card)',
          backdropFilter: 'blur(10px)',
        }}
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </motion.div>
  );

  const PulsingDots = () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: variantGradients[variant],
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </div>
  );

  return (
    <div className={className} style={containerStyles}>
      {/* Main loading animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          ...glassEffects.primary,
          padding: '32px',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        <LoadingOrb />
        
        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: size === 'large' ? '18px' : '16px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '16px',
          }}
        >
          {message}
        </motion.div>

        {/* Progress bar */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ width: '100%' }}
          >
            <Progress
              percent={progress}
              strokeColor={{
                '0%': variantGradients[variant].split(' ')[1],
                '100%': variantGradients[variant].split(' ')[3],
              }}
              trailColor="var(--color-border-secondary)"
              strokeWidth={8}
              strokeLinecap="round"
            />
          </motion.div>
        )}

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginTop: 16 }}
        >
          <PulsingDots />
        </motion.div>
      </motion.div>
    </div>
  );
};

interface SkeletonLoaderProps {
  rows?: number;
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;
  active?: boolean;
  className?: string;
}

export const PremiumSkeleton: React.FC<SkeletonLoaderProps> = ({
  rows = 3,
  avatar = false,
  title = true,
  paragraph = true,
  active = true,
  className = '',
}) => {
  const shimmerVariants = {
    loading: {
      backgroundPosition: ['-200% 0', '200% 0'],
      transition: {
        duration: 2,
        ease: 'linear' as any,
        repeat: Infinity,
      }
    }
  };

  const SkeletonBar = ({ width, height = '12px', delay = 0 }: { width: string; height?: string; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0.95, scale: 0.95 }}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-bg-elevated) 50%, var(--color-bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: '6px',
        position: 'relative',
        overflow: 'hidden',
      }}
      animate={active ? { backgroundPosition: ['-200% 0', '200% 0'] } : undefined}
      transition={active ? { duration: 2, ease: 'linear' as any, repeat: Infinity, delay } : undefined}
    />
  );

  return (
    <div className={className} style={{
      ...glassEffects.secondary,
      padding: '24px',
      borderRadius: '16px',
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {avatar && (
          <motion.div
            initial={{ opacity: 0.95, scale: 0.95 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-bg-elevated) 50%, var(--color-bg-secondary) 75%)',
              backgroundSize: '200% 100%',
              flexShrink: 0,
            }}
            animate={active ? { backgroundPosition: ['-200% 0', '200% 0'] } : undefined}
            transition={active ? { duration: 2, ease: 'linear' as any, repeat: Infinity } : undefined}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {title && <SkeletonBar width="60%" height="16px" delay={0.1} />}
          {paragraph && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: rows }, (_, i) => (
                <SkeletonBar
                  key={i}
                  width={i === rows - 1 ? '40%' : '100%'}
                  delay={0.2 + i * 0.1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SmartLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: boolean;
  skeletonProps?: Partial<SkeletonLoaderProps>;
  loaderProps?: Partial<PremiumLoaderProps>;
}

export const SmartLoader: React.FC<SmartLoaderProps> = ({
  loading,
  children,
  skeleton = false,
  skeletonProps = {},
  loaderProps = {},
}) => {
  if (!loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return skeleton ? (
    <PremiumSkeleton {...skeletonProps} />
  ) : (
    <PremiumLoader {...loaderProps} />
  );
};

export default PremiumLoader;
