/**
 * Enhanced Responsive Grid System
 * Perfect mobile-first responsive design with theme integration
 * Implements SOLID principles with comprehensive breakpoint support
 */
'use client';

import React from 'react';
import { Row, Col, RowProps, ColProps } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveColProps extends Omit<ColProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> {
  children: React.ReactNode;
  mobile?: number;      // xs and sm (0-767px)
  tablet?: number;      // md (768-1023px)
  desktop?: number;     // lg (1024-1439px)
  wide?: number;        // xl (1440-1919px)
  ultraWide?: number;   // xxl (1920px+)
  // Allow override for specific breakpoints
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  // Responsive utilities
  className?: string;
  animate?: boolean;
}

interface ResponsiveRowProps extends RowProps {
  children: React.ReactNode;
  mobileGutter?: number | [number, number];
  tabletGutter?: number | [number, number];
  desktopGutter?: number | [number, number];
  wideGutter?: number | [number, number];
  ultraWideGutter?: number | [number, number];
  className?: string;
  animate?: boolean;
  stagger?: number; // For staggered animations
}

/**
 * ResponsiveCol Component
 * Simplifies responsive column definitions with sensible defaults
 */
export const ResponsiveCol: React.FC<ResponsiveColProps> = ({
  children,
  mobile = 24,  // Default: full width
  tablet = 12,  // Default: half width
  desktop = 8,  // Default: third width
  wide = 6,     // Default: quarter width
  ultraWide = 4, // Default: sixth width
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  className = '',
  animate = false, // Disable by default to avoid conflicts
  ...restProps
}) => {
  const responsive = useResponsive();
  
  const colClassName = [
    className,
    animate && 'fade-in',
    responsive.isTouchDevice && 'touch-optimized'
  ].filter(Boolean).join(' ');


  return (
    <Col
      xs={xs ?? mobile}
      sm={sm ?? mobile}
      md={md ?? tablet}
      lg={lg ?? desktop}
      xl={xl ?? wide}
      xxl={xxl ?? ultraWide}
      className={colClassName}
      style={{
        overflow: 'hidden',
        ...restProps.style
      }}
      {...restProps}
    >
      {children}
    </Col>
  );
};

/**
 * ResponsiveRow Component
 * Provides responsive gutter spacing
 */
export const ResponsiveRow: React.FC<ResponsiveRowProps> = ({
  children,
  mobileGutter = [12, 12],
  tabletGutter = [16, 16],
  desktopGutter = [24, 24],
  wideGutter = [32, 32],
  ultraWideGutter = [40, 40],
  gutter,
  className = '',
  animate = true,
  stagger = 100,
  ...restProps
}) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, isUltraWide } = useResponsive();
  
  const responsiveGutter = gutter ?? (
    isMobile ? mobileGutter :
    isTablet ? tabletGutter :
    isDesktop ? desktopGutter :
    isLargeDesktop ? wideGutter :
    ultraWideGutter
  );
  
  const rowClassName = [
    className,
    animate && 'slide-up',
    isMobile && 'mobile-row',
    isTablet && 'tablet-row',
    isDesktop && 'desktop-row'
  ].filter(Boolean).join(' ');
  
  // Temporarily disable staggered animation to fix grid issue
  // const childrenWithStagger = animate && stagger > 0 
  //   ? React.Children.map(children, (child, index) => {
  //       if (React.isValidElement(child)) {
  //         return React.cloneElement(child, {
  //           style: {
  //             ...child.props.style,
  //             animationDelay: `${index * stagger}ms`
  //           }
  //         });
  //       }
  //       return child;
  //     })
  //   : children;
  
  return (
    <Row gutter={responsiveGutter} className={rowClassName} {...restProps}>
      {children}
    </Row>
  );
};

/**
 * ResponsiveGrid Component
 * Complete responsive grid system with predefined layouts
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  layout?: 'dashboard' | 'cards' | 'form' | 'table' | 'custom';
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  centered?: boolean;
  animate?: boolean;
  background?: 'default' | 'gradient' | 'glass' | 'none';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  layout = 'dashboard',
  className = '',
  style = {},
  maxWidth = 'full',
  centered = true,
  animate = true,
  background = 'default'
}) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, isUltraWide, prefersReducedMotion } = useResponsive();
  const theme = useTheme();
  
  // Dynamic spacing based on screen size
  const getSpacing = () => {
    if (isMobile) return 'var(--spacing-md)';
    if (isTablet) return 'var(--spacing-lg)';
    if (isDesktop) return 'var(--spacing-xl)';
    if (isLargeDesktop) return 'var(--spacing-xxl)';
    return 'var(--spacing-xxxl)';
  };
  
  // Layout-specific styles
  const layoutStyles: Record<string, React.CSSProperties> = {
    dashboard: {
      padding: getSpacing(),
      gap: getSpacing(),
      minHeight: '100vh',
    },
    cards: {
      padding: `calc(${getSpacing()} * 0.75)`,
      gap: `calc(${getSpacing()} * 0.75)`,
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : isTablet 
          ? 'repeat(auto-fit, minmax(300px, 1fr))'
          : 'repeat(auto-fit, minmax(350px, 1fr))',
    },
    form: {
      maxWidth: {
        sm: '640px',
        md: '768px', 
        lg: '1024px',
        xl: '1280px',
        xxl: '1536px',
        full: '100%'
      }[maxWidth],
      margin: centered ? '0 auto' : undefined,
      padding: getSpacing(),
    },
    table: {
      padding: isMobile ? 'var(--spacing-sm)' : getSpacing(),
      overflowX: 'auto',
      minWidth: 0, // Prevent flex overflow
    },
    custom: {}
  };
  
  // Background styles
  const backgroundStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--color-bg-secondary)'
    },
    gradient: {
      background: 'var(--color-bg-gradient)'
    },
    glass: {
      background: 'var(--glass-bg-secondary)',
      backdropFilter: 'var(--glass-backdrop-filter)',
      border: 'var(--glass-border)',
      borderRadius: '20px'
    },
    none: {}
  };
  
  const gridClassName = [
    'responsive-grid',
    `responsive-grid--${layout}`,
    animate && !prefersReducedMotion && 'fade-in',
    background === 'glass' && 'glass-card',
    (background === 'gradient' && theme?.isDark) && 'on-gradient',
    isMobile && 'mobile-grid',
    isTablet && 'tablet-grid',
    isDesktop && 'desktop-grid',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={gridClassName}
      style={{
        width: '100%',
        transition: 'all var(--animation-duration-normal) var(--animation-easing)',
        ...backgroundStyles[background],
        ...layoutStyles[layout],
        ...style
      }}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Container Component
 * Provides max-width constraints for better readability
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  centered?: boolean;
  padding?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  background?: 'default' | 'elevated' | 'glass' | 'gradient' | 'none';
  animate?: boolean;
  safe?: boolean; // Safe area insets for mobile
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  centered = true,
  padding = true,
  className = '',
  style = {},
  background = 'none',
  animate = true,
  safe = true
}) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, prefersReducedMotion } = useResponsive();
  const theme = useTheme();
  
  const maxWidthValues = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
    full: '100%'
  };
  
  // Dynamic padding based on screen size and preference
  const getPaddingValue = () => {
    if (!padding) return 0;
    
    const paddingSizes = {
      sm: 'var(--spacing-md)',
      md: 'var(--spacing-lg)', 
      lg: 'var(--spacing-xl)',
      xl: 'var(--spacing-xxl)'
    };
    
    if (typeof padding === 'string' && padding in paddingSizes) {
      return paddingSizes[padding as keyof typeof paddingSizes];
    }
    
    // Auto padding based on screen size
    if (isMobile) return safe ? 'var(--spacing-lg) env(safe-area-inset-right) var(--spacing-lg) env(safe-area-inset-left)' : 'var(--spacing-lg)';
    if (isTablet) return 'var(--spacing-xl)';
    if (isDesktop) return 'var(--spacing-xxl)';
    if (isLargeDesktop) return 'var(--spacing-xxxl)';
    return 'var(--spacing-xxxxl)';
  };
  
  // Background styles
  const backgroundStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--color-bg-primary)'
    },
    elevated: {
      background: 'var(--color-bg-elevated)',
      boxShadow: '0 1px 3px var(--shadow-sm), 0 1px 2px var(--shadow-sm)',
      borderRadius: '12px'
    },
    glass: {
      background: 'var(--glass-bg-card)',
      backdropFilter: 'var(--glass-backdrop-filter)',
      border: 'var(--glass-border)',
      borderRadius: '16px',
      boxShadow: 'var(--glass-shadow)'
    },
    gradient: {
      background: 'var(--color-bg-gradient)'
    },
    none: {}
  };
  
  const containerClassName = [
    'responsive-container',
    `responsive-container--${background}`,
    animate && !prefersReducedMotion && 'fade-in',
    safe && 'safe-area',
    (background === 'gradient' && theme?.isDark) && 'on-gradient',
    className
  ].filter(Boolean).join(' ');
  
  const container = (
    <div
      className={containerClassName}
      style={{
        width: '100%',
        maxWidth: maxWidthValues[maxWidth],
        margin: centered ? '0 auto' : undefined,
        padding: getPaddingValue(),
        transition: 'all var(--animation-duration-normal) var(--animation-easing)',
        ...backgroundStyles[background],
        ...style
      }}
    >
      {children}
    </div>
  );

  // No nested ConfigProvider; rely on scoped CSS (class on-gradient in dark mode only)
  return container;
};

// Utility component for responsive visibility
export const ResponsiveShow: React.FC<{
  children: React.ReactNode;
  on?: ('mobile' | 'tablet' | 'desktop' | 'wide' | 'ultraWide')[];
  only?: 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultraWide';
}> = ({ children, on, only }) => {
  const responsive = useResponsive();
  
  if (only) {
    const shouldShow = (
      (only === 'mobile' && responsive.isMobile) ||
      (only === 'tablet' && responsive.isTablet) ||
      (only === 'desktop' && responsive.isDesktop) ||
      (only === 'wide' && responsive.isLargeDesktop) ||
      (only === 'ultraWide' && responsive.isUltraWide)
    );
    return shouldShow ? <>{children}</> : null;
  }
  
  if (on) {
    const shouldShow = on.some(breakpoint => {
      switch (breakpoint) {
        case 'mobile': return responsive.isMobile;
        case 'tablet': return responsive.isTablet;
        case 'desktop': return responsive.isDesktop;
        case 'wide': return responsive.isLargeDesktop;
        case 'ultraWide': return responsive.isUltraWide;
        default: return false;
      }
    });
    return shouldShow ? <>{children}</> : null;
  }
  
  return <>{children}</>;
};

// Utility component for responsive hiding
export const ResponsiveHide: React.FC<{
  children: React.ReactNode;
  on: ('mobile' | 'tablet' | 'desktop' | 'wide' | 'ultraWide')[];
}> = ({ children, on }) => {
  const responsive = useResponsive();
  
  const shouldHide = on.some(breakpoint => {
    switch (breakpoint) {
      case 'mobile': return responsive.isMobile;
      case 'tablet': return responsive.isTablet;
      case 'desktop': return responsive.isDesktop;
      case 'wide': return responsive.isLargeDesktop;
      case 'ultraWide': return responsive.isUltraWide;
      default: return false;
    }
  });
  
  return shouldHide ? null : <>{children}</>;
};

// Note: avoid a default export object to prevent accidental `import x from ...` usage
// that can confuse treeshaking/bundling. Prefer named exports only.
// (All components above are already exported as named exports.)
