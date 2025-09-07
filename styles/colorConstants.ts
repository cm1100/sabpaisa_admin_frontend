/**
 * Centralized Color Constants
 * Single source of truth for all colors in the application
 * These values are used by both the Ant Design theme system and CSS variables
 */

export const COLOR_PALETTE = {
  // Primary colors
  primary: {
    50: '#F0EFFF',
    100: '#E0DEFF',
    200: '#C7C3FF',
    300: '#A5A0FF',
    400: '#8B84FF',
    500: '#635BFF', // Main primary
    600: '#5469D4',
    700: '#4356C0',
    800: '#3344A8',
    900: '#2A3690'
  },
  
  // Success colors
  success: {
    50: '#EDFFF0',
    100: '#D3FFD8',
    200: '#AAFBB5',
    300: '#73F088',
    400: '#3CDC56',
    500: '#00D924', // Main success
    600: '#00B81F',
    700: '#00971C',
    800: '#00751A',
    900: '#005C17'
  },
  
  // Warning colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBB040',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  
  // Error colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#ED5F59', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },
  
  // Info colors
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#1890FF', // Main info
    600: '#0E7FE8',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  },
  
  // Gray colors
  gray: {
    50: '#FAFBFC',
    100: '#F6F9FC',
    200: '#EEF5FF',
    300: '#E3E8EE',
    400: '#C1C9D2',
    500: '#8B95A1',
    600: '#697386',
    700: '#425466',
    800: '#2D3748',
    900: '#0A0E27'
  }
} as const;

// Background colors
export const BG_COLORS = {
  elevated: '#FFFFFF',
  container: '#F6F9FC',
  subtle: '#FAFAFA',
  layout: '#F0F2F5',
  // Dark mode
  dark: {
    container: '#1A1A2E',
    layout: '#0A0E27',
    elevated: '#242B4D',
    spotlight: '#16213E'
  }
} as const;

// Text colors
export const TEXT_COLORS = {
  primary: '#0A0E27',
  secondary: '#425466',
  tertiary: '#697386',
  quaternary: '#8B95A1',
  placeholder: '#C1C9D2',
  disabled: '#E3E8EE',
  white: '#FFFFFF',
  // Dark mode
  dark: {
    primary: '#FFFFFF',
    secondary: '#B3B8C4',
    tertiary: '#9CA3AF',
    quaternary: '#8B95A1',
    placeholder: '#6B7280',
    disabled: '#4B5563',
    heading: '#FFFFFF',
    label: '#B3B8C4',
    description: '#9CA3AF'
  }
} as const;

// Border colors
export const BORDER_COLORS = {
  primary: '#E3E8EE',
  secondary: '#F0F0F0',
  light: '#F6F9FC',
  // Dark mode
  dark: {
    primary: '#2A2F3A',
    secondary: '#1F242F',
    split: '#2A2F3A'
  }
} as const;

// Export main colors for easy access
export const COLORS = {
  primary: COLOR_PALETTE.primary[500],
  success: COLOR_PALETTE.success[500],
  warning: COLOR_PALETTE.warning[500],
  error: COLOR_PALETTE.error[500],
  info: COLOR_PALETTE.info[500],
  gray: COLOR_PALETTE.gray[500],
  white: '#FFFFFF',
  black: '#000000'
} as const;

// Gradients
export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLOR_PALETTE.primary[500]} 0%, ${COLOR_PALETTE.primary[600]} 100%)`,
  success: `linear-gradient(135deg, ${COLOR_PALETTE.success[500]} 0%, ${COLOR_PALETTE.success[600]} 100%)`,
  warning: `linear-gradient(135deg, ${COLOR_PALETTE.warning[400]} 0%, ${COLOR_PALETTE.warning[500]} 100%)`,
  info: `linear-gradient(135deg, ${COLOR_PALETTE.info[500]} 0%, ${COLOR_PALETTE.info[600]} 100%)`,
  error: `linear-gradient(135deg, ${COLOR_PALETTE.error[500]} 0%, ${COLOR_PALETTE.error[600]} 100%)`,
  background: `linear-gradient(135deg, ${BG_COLORS.container} 0%, ${COLOR_PALETTE.gray[200]} 50%, #E8F2FF 100%)`,
  text: `linear-gradient(135deg, ${TEXT_COLORS.primary} 0%, ${COLOR_PALETTE.primary[500]} 100%)`,
  shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
} as const;