/**
 * Enhanced Central Theme System
 * World-class responsive design with comprehensive theme tokens
 */
import { theme } from '@/components/ui';

// Enhanced breakpoints for perfect responsive design
export const breakpoints = {
  xs: 0,      // Mobile portrait: 0-479px
  sm: 480,    // Mobile landscape: 480-767px
  md: 768,    // Tablet: 768-1023px
  lg: 1024,   // Desktop: 1024-1439px
  xl: 1440,   // Large desktop: 1440-1919px
  xxl: 1920   // Ultra-wide: 1920px+
} as const;

// Perfect spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "var(--font-mono), 'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7
  }
} as const;

// Enhanced color palette
const baseColors = {
  primary: {
    50: '#F0EFFF', 100: '#E0DEFF', 200: '#C7C3FF', 300: '#A5A0FF',
    400: '#8B84FF', 500: '#635BFF', 600: '#5469D4', 700: '#4356C0',
    800: '#3344A8', 900: '#2A3690'
  },
  success: {
    50: '#EDFFF0', 100: '#D3FFD8', 200: '#AAFBB5', 300: '#73F088',
    400: '#3CDC56', 500: '#00D924', 600: '#00B81F', 700: '#00971C',
    800: '#00751A', 900: '#005C17'
  },
  warning: {
    50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
    400: '#FBB040', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
    800: '#92400E', 900: '#78350F'
  },
  error: {
    50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5',
    400: '#F87171', 500: '#ED5F59', 600: '#DC2626', 700: '#B91C1C',
    800: '#991B1B', 900: '#7F1D1D'
  },
  info: {
    50: '#F0F6FF', 100: '#E1EEFF', 200: '#C7DFFF', 300: '#9DC4FF',
    400: '#78ADFF', 500: '#4F8CFF', 600: '#3C79F0', 700: '#285FD6',
    800: '#214EB1', 900: '#1C3F8C'
  },
  // Cooler gray scale that pairs better with purple primary
  gray: {
    50: '#FAFBFC', 100: '#F6F8FD', 200: '#EEF2FA', 300: '#E3E8F2',
    400: '#C6CCDA', 500: '#9AA3B8', 600: '#75809B', 700: '#4A5470',
    800: '#2B3352', 900: '#161A33'
  }
} as const;

// Light theme configuration (Enhanced Ant Design compatible)
export const themeConfig = {
  token: {
    // Primary colors
    colorPrimary: baseColors.primary[500],
    colorPrimaryBg: baseColors.primary[50],
    colorPrimaryBgHover: baseColors.primary[100],
    colorPrimaryBorder: baseColors.primary[300],
    colorPrimaryBorderHover: baseColors.primary[400],
    colorPrimaryHover: baseColors.primary[600],
    colorPrimaryActive: baseColors.primary[700],
    colorPrimaryTextHover: baseColors.primary[600],
    colorPrimaryText: baseColors.primary[500],
    colorPrimaryTextActive: baseColors.primary[700],

    // Success colors
    colorSuccess: baseColors.success[500],
    colorSuccessBg: baseColors.success[50],
    colorSuccessBgHover: baseColors.success[100],
    colorSuccessBorder: baseColors.success[300],
    colorSuccessBorderHover: baseColors.success[400],
    colorSuccessHover: baseColors.success[600],
    colorSuccessActive: baseColors.success[700],

    // Error colors
    colorError: baseColors.error[500],
    colorErrorBg: baseColors.error[50],
    colorErrorBgHover: baseColors.error[100],
    colorErrorBorder: baseColors.error[300],
    colorErrorBorderHover: baseColors.error[400],
    colorErrorHover: baseColors.error[600],
    colorErrorActive: baseColors.error[700],

    // Warning colors
    colorWarning: baseColors.warning[400],
    colorWarningBg: baseColors.warning[50],
    colorWarningBgHover: baseColors.warning[100],
    colorWarningBorder: baseColors.warning[300],
    colorWarningBorderHover: baseColors.warning[400],
    colorWarningHover: baseColors.warning[500],
    colorWarningActive: baseColors.warning[600],

    // Info colors
    colorInfo: baseColors.info[500],
    colorInfoBg: baseColors.info[50],
    colorInfoBgHover: baseColors.info[100],
    colorInfoBorder: baseColors.info[300],
    colorInfoBorderHover: baseColors.info[400],
    colorInfoHover: baseColors.info[600],
    colorInfoActive: baseColors.info[700],

    // Layout colors
    colorBgContainer: '#FFFFFF',
    colorBgLayout: baseColors.gray[100],
    colorBgElevated: '#FFFFFF',
    colorBgSpotlight: baseColors.gray[50],

    // Text colors
    colorText: baseColors.gray[900],
    colorTextSecondary: baseColors.gray[700],
    colorTextTertiary: baseColors.gray[600],
    colorTextQuaternary: baseColors.gray[500],
    colorTextPlaceholder: baseColors.gray[400],
    colorTextDisabled: baseColors.gray[300],
    colorTextHeading: baseColors.gray[900],
    colorTextLabel: baseColors.gray[700],
    colorTextDescription: baseColors.gray[600],
    // Ensure text on solid primary (buttons, tags) is readable (white)
    colorTextLightSolid: '#FFFFFF',
    // Link colors harmonized with purple primary
    colorLink: baseColors.primary[500],
    colorLinkHover: baseColors.primary[600],
    colorLinkActive: baseColors.primary[700],

    // Border colors
    colorBorder: baseColors.gray[300],
    colorBorderSecondary: baseColors.gray[200],
    colorSplit: baseColors.gray[300],

    // Font settings
    fontFamily: typography.fontFamily.sans,
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // Line heights
    lineHeight: 1.5715,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // Control heights
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 32,
    controlHeightXS: 24,

    // Spacing
    marginXS: spacing.sm,
    marginSM: spacing.md,
    margin: spacing.lg,
    marginMD: spacing.xl,
    marginLG: spacing.xl,
    marginXL: spacing.xxl,
    marginXXL: spacing.xxxxl,

    paddingXS: spacing.sm,
    paddingSM: spacing.md,
    padding: spacing.lg,
    paddingMD: spacing.xl,
    paddingLG: spacing.xl,
    paddingXL: spacing.xxl,

    // Motion
    motionDurationFast: '0.15s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    motionEaseIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    motionEaseOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    motionEaseInBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Shadows
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
  },
  algorithm: theme.defaultAlgorithm,
};

// Dark theme configuration (Enhanced)
export const darkThemeConfig = {
  ...themeConfig,
  token: {
    ...themeConfig.token,
    // Layout colors for dark mode
    colorBgContainer: '#0F172A',
    colorBgLayout: '#111827',
    colorBgElevated: '#1F2937',
    colorBgSpotlight: '#1E293B',

    // Text colors for dark mode
    colorText: '#FFFFFF',
    colorTextSecondary: '#B3B8C4',
    colorTextTertiary: '#9CA3AF',
    colorTextQuaternary: '#8B95A1',
    colorTextPlaceholder: '#6B7280',
    colorTextDisabled: '#4B5563',
    colorTextHeading: '#FFFFFF',
    colorTextLabel: '#B3B8C4',
    colorTextDescription: '#9CA3AF',

    // Border colors for dark mode
    colorBorder: '#2A2F3A',
    colorBorderSecondary: '#1F242F',
    colorSplit: '#2A2F3A',

    // Neutral primary for dark mode
    colorPrimary: '#64748B',
    colorPrimaryBg: '#1F2937',
    colorPrimaryBgHover: '#273449',
    colorPrimaryBorder: '#334155',
    colorPrimaryBorderHover: '#42536A',

    // Shadows for dark mode
    boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.35)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.28)',
  },
  algorithm: theme.darkAlgorithm,
};

// ProLayout specific theme
export const proLayoutTheme = {
  bgColor: 'var(--color-bg-primary)',
  primaryColor: '#635BFF',
  layout: 'mix' as const,
  splitMenus: false,
  navTheme: 'light' as const,
  contentWidth: 'Fluid' as const,
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'SabPaisa Admin',
  iconfontUrl: '',
  siderWidth: 256,
  headerHeight: 64,
  
  token: {
    header: {
      colorBgHeader: 'var(--color-bg-elevated)',
      colorHeaderTitle: 'var(--color-text-primary)',
      colorTextMenu: 'var(--color-text-secondary)',
      colorTextMenuSecondary: 'var(--color-text-tertiary)',
      colorTextMenuSelected: 'var(--color-primary)',
      colorBgMenuItemSelected: 'var(--color-primary-alpha-10)', // 10% opacity
      colorTextMenuActive: 'var(--color-primary)',
      colorTextRightActionsItem: 'var(--color-text-tertiary)',
    },
    sider: {
      colorMenuBackground: 'var(--color-bg-elevated)',
      colorMenuItemDivider: 'var(--color-border-primary)',
      colorTextMenu: 'var(--color-text-secondary)',
      colorTextMenuSelected: 'var(--color-primary)',
      colorBgMenuItemSelected: 'var(--color-primary-alpha-10)', // 10% opacity
      colorTextMenuActive: 'var(--color-primary)',
      colorBgMenuItemHover: 'var(--color-bg-secondary)',
      colorBgMenuItemActive: 'var(--color-primary-alpha-10)', // 10% opacity
      colorTextMenuItemHover: 'var(--color-text-primary)',
      colorTextSubMenuSelected: 'var(--color-primary)',
    },
    pageContainer: {
      paddingBlockPageContainerContent: 24,
      paddingInlinePageContainerContent: 24,
      colorBgPageContainer: 'var(--color-bg-secondary)',
      colorBgPageContainerFixed: 'var(--color-bg-elevated)',
    },
  },
};

// Chart colors palette
export const chartColors = {
  primary: ['#635BFF', '#5469D4', '#4356C0', '#8B84FF', '#A5A0FF'],
  success: ['#00D924', '#00B81F', '#00971C', '#3CDC56', '#73F088'],
  danger: ['#ED5F59', '#DC2626', '#B91C1C', '#F87171', '#FCA5A5'],
  warning: ['#FBB040', '#F59E0B', '#D97706', '#FCD34D', '#FDE68A'],
  info: ['#4F8CFF', '#3C79F0', '#285FD6', '#78ADFF', '#9DC4FF'],
  
  // Combined palette for multi-series charts
  mixed: [
    '#635BFF', '#00D924', '#FBB040', '#4F8CFF', '#ED5F59',
    '#5469D4', '#00B81F', '#F59E0B', '#3C79F0', '#DC2626',
  ],
  
  // Gradient pairs for area charts
  gradients: [
    ['#635BFF', '#F0EFFF'],
    ['#00D924', '#EDFFF0'],
    ['#FBB040', '#FFFBEB'],
    ['#1890FF', '#EFF6FF'],
    ['#ED5F59', '#FEF2F2'],
  ],
};

// Pure color tokens for places that require concrete colors (e.g., chart borders)
export const pureColors = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#635BFF',
};


// Animation presets for premium experience
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  slideInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  float: {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        ease: [0.4, 0, 0.2, 1],
        repeat: Infinity,
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: [0.4, 0, 0.2, 1],
        repeat: Infinity,
      }
    }
  },
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 2,
        ease: [0, 0, 1, 1],
        repeat: Infinity,
      }
    }
  }
};

// Premium glass effects
export const glassEffects = {
  primary: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(99, 91, 255, 0.1)',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
  }
};

// Premium gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #635BFF 0%, #5469D4 100%)',
  success: 'linear-gradient(135deg, #00D924 0%, #00B81F 100%)',
  warning: 'linear-gradient(135deg, #FBB040 0%, #F59E0B 100%)',
  info: 'linear-gradient(135deg, #1890FF 0%, #0E7FE8 100%)',
  danger: 'linear-gradient(135deg, #ED5F59 0%, #DC2626 100%)',
  background: 'linear-gradient(135deg, #F6F9FC 0%, #E3E8EE 100%)',
  text: 'linear-gradient(135deg, #0A0E27 0%, #425466 100%)',
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
};
