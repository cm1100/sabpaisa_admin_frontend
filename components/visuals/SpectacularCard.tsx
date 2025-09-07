/**
 * Spectacular Visual Enhancement Components
 * Creates WOW factor for non-technical judges
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Spectacular Glass Card with floating animations
export const SpectacularCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}> = ({ children, className = '', hoverable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={hoverable ? { y: -8, scale: 1.02 } : {}}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 100 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Spectacular Metric Card with animated numbers
export const SpectacularMetricCard: React.FC<{
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  chart?: React.ReactNode;
}> = ({ 
  title, 
  value, 
  suffix, 
  prefix, 
  trend, 
  trendLabel, 
  icon, 
  color = 'primary',
  chart 
}) => {
  const colorClasses = {
    primary: 'stunning-pill',
    success: 'stunning-pill success',
    warning: 'stunning-pill warning',
    danger: 'stunning-pill danger',
    info: 'stunning-pill info'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.015,
        y: -6,
        transition: { duration: 0.3 }
      }}
      style={{ 
        height: 180,
        padding: 24,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Background Orb */}
      <motion.div
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -15, 10, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${
            color === 'primary' ? 'var(--color-primary-alpha-10)' :
            color === 'success' ? 'var(--color-success-alpha-10)' :
            color === 'warning' ? 'var(--color-warning-alpha-10)' :
            color === 'danger' ? 'var(--color-error-alpha-10)' :
            'var(--color-info-alpha-10)'
          }, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(20px)',
          zIndex: 0
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-14)', 
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            {title}
          </h4>
          {icon && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: 18, color: 'var(--color-primary)' }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "backOut" }}
        >
          <Statistic
            value={value}
            suffix={suffix}
            prefix={prefix}
          />
        </motion.div>

        {trend !== undefined && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ marginTop: 8 }}
          >
            <span style={{
              fontSize: 'var(--font-size-12)',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              borderRadius: 12
            }}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}% {trendLabel}
            </span>
          </motion.div>
        )}

        {chart && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{ 
              marginTop: 16, 
              height: 40,
              transformOrigin: 'left center'
            }}
          >
            {chart}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Spectacular Header with floating elements
export const SpectacularHeader: React.FC<{
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; value: string; color: string }>;
  children?: React.ReactNode;
}> = ({ title, subtitle, badges = [], children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      style={{ 
        padding: 32, 
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Multiple Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, var(--color-primary-alpha-15), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -25, 35, 0],
          y: [0, 20, -30, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, var(--color-success-alpha-12), transparent)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "backOut" }}
              style={{ 
                fontSize: 42, 
                margin: 0, 
                marginBottom: 8,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{ 
                  fontSize: 16, 
                  color: 'var(--color-text-secondary)', 
                  fontWeight: 500,
                  margin: '0 0 20px 0'
                }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Animated Badges */}
            {badges.length > 0 && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.6 + (index * 0.1), 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 150
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{badge.value}</strong> {badge.label}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{ marginLeft: 32 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Spectacular Chart Container
export const SpectacularChartContainer: React.FC<{
  title: string;
  icon?: string;
  children: React.ReactNode;
  height?: number;
}> = ({ title, icon = "📊", children, height = 350 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 24, height }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-text-heading)',
            margin: 0
          }}
        >
          {title}
        </motion.h3>
        
        <motion.div
          className="on-primary"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'var(--color-gradient-primary)',
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 8,
            paddingRight: 8,
            borderRadius: 8,
            fontSize: 16
          }}
        >
          {icon}
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ height: '100%' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Spectacular Live Indicator
export const SpectacularLiveIndicator: React.FC<{
  text?: string;
}> = ({ text = "Live" }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          'var(--shadow-success-medium)',
          'var(--shadow-success-strong)',
          'var(--shadow-success-medium)'
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 8,
          height: 8,
          background: 'var(--color-white)',
          borderRadius: '50%',
          marginRight: 6
        }}
      />
      {text}
    </motion.div>
  );
};

export default {
  SpectacularCard,
  SpectacularMetricCard,
  SpectacularHeader,
  SpectacularChartContainer,
  SpectacularLiveIndicator
};
