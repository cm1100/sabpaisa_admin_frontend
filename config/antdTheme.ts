/**
 * Ant Design 5 Theme Configuration
 * Centralized theme tokens for consistent styling across the application
 */

import type { ThemeConfig } from '@/components/ui';
import { themeConfig } from '@/styles/theme';

export const antdTheme: ThemeConfig = {
  token: {
    // Colors (inherit from centralized theme tokens)
    colorPrimary: themeConfig.token.colorPrimary,
    colorSuccess: themeConfig.token.colorSuccess,
    colorWarning: themeConfig.token.colorWarning,
    colorError: themeConfig.token.colorError,
    colorInfo: themeConfig.token.colorInfo,
    // Align to AntD v5 token names
    colorText: themeConfig.token.colorText,
    colorBgContainer: themeConfig.token.colorBgContainer,
    
    // Border
    borderRadius: 8,
    
    // Spacing (following 8px grid system)
    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingLG: 24,
    paddingXL: 32,
    
    margin: 16,
    marginXS: 8,
    marginSM: 12,
    marginLG: 24,
    marginXL: 32,
    
    // Typography
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Layout
    screenXS: 480,
    screenSM: 576,
    screenMD: 768,
    screenLG: 992,
    screenXL: 1200,
    screenXXL: 1600,
  },
  
  components: {
    // Card component tokens
    Card: {
      paddingLG: 24,
      paddingContentHorizontalLG: 24,
    },
    
    // Table component tokens
    Table: {
      headerBg: 'var(--color-bg-secondary)',
      headerBorderRadius: 8,
    },
    
    // Button component tokens
    Button: {
      controlHeight: 40,
      borderRadius: 8,
    },
    
    // Space component tokens
    Space: {
      // Custom space sizes
    },
    
    // Statistic component tokens
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
  },
};

// Semantic spacing tokens
export const spacing = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Responsive breakpoints
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

// Pre-defined component styles
export const componentStyles = {
  card: {
    default: {
      borderRadius: 8,
      marginBottom: 16,
    },
    interactive: {
      borderRadius: 8,
      marginBottom: 16,
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
  },
  statistic: {
    card: {
      height: '100%',
    },
  },
} as const;
