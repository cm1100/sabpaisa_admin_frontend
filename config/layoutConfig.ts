/**
 * Centralized Responsive Layout Configuration
 * Single source of truth for all responsive column spans
 * Update these values to change layouts across the entire application
 */

export const LAYOUT_CONFIG = {
  // Full width sections
  fullWidth: {
    mobile: 24,
    tablet: 24,
    desktop: 24,
    wide: 24,
    ultraWide: 24,
  },

  // Main content with sidebar
  mainContent: {
    mobile: 24,
    tablet: 24,
    desktop: 16,
    wide: 16,
    ultraWide: 16,
  },

  sidebar: {
    mobile: 24,
    tablet: 24,
    desktop: 8,
    wide: 8,
    ultraWide: 8,
  },

  // Two column layout (50/50)
  halfWidth: {
    mobile: 24,
    tablet: 12,
    desktop: 12,
    wide: 12,
    ultraWide: 12,
  },

  // Three column layout
  thirdWidth: {
    mobile: 24,
    tablet: 24,
    desktop: 8,
    wide: 8,
    ultraWide: 8,
  },

  // Four column layout (metrics cards)
  quarterWidth: {
    mobile: 12,  // 2 per row on mobile
    tablet: 12,  // 2 per row on tablet
    desktop: 6,  // 4 per row on desktop
    wide: 6,     // 4 per row on wide
    ultraWide: 6, // 4 per row on ultra-wide
  },

  // Six column layout
  sixthWidth: {
    mobile: 24,
    tablet: 12,
    desktop: 4,
    wide: 4,
    ultraWide: 4,
  },

  // Asymmetric layouts
  twoThirds: {
    mobile: 24,
    tablet: 24,
    desktop: 16,
    wide: 16,
    ultraWide: 16,
  },

  oneThird: {
    mobile: 24,
    tablet: 24,
    desktop: 8,
    wide: 8,
    ultraWide: 8,
  },

  // Special layouts for dashboard
  dashboard: {
    // Header section
    header: {
      title: {
        mobile: 24,
        tablet: 12,
        desktop: 14,
        wide: 14,
        ultraWide: 14,
      },
      actions: {
        mobile: 24,
        tablet: 12,
        desktop: 10,
        wide: 10,
        ultraWide: 10,
      },
    },

    // Metric cards (4 cards in a row on desktop)
    metricCard: {
      mobile: 12,  // 2 per row
      tablet: 12,  // 2 per row
      desktop: 6,  // 4 per row
      wide: 6,
      ultraWide: 6,
    },

    // Chart layouts
    mainChart: {
      mobile: 24,
      tablet: 24,
      desktop: 16,
      wide: 16,
      ultraWide: 16,
    },

    sideChart: {
      mobile: 24,
      tablet: 24,
      desktop: 8,
      wide: 8,
      ultraWide: 8,
    },

    // Info cards (3 in a row on desktop)
    infoCard: {
      mobile: 24,
      tablet: 24,
      desktop: 8,
      wide: 8,
      ultraWide: 8,
    },
  },

  // Transaction detail page layouts
  transactionDetail: {
    // Summary cards at top
    summaryCard: {
      mobile: 24,
      tablet: 12,
      desktop: 6,
      wide: 6,
      ultraWide: 6,
    },

    // Information sections
    infoSection: {
      mobile: 24,
      tablet: 12,
      desktop: 12,
      wide: 12,
      ultraWide: 12,
    },
  },

  // Table page layouts
  table: {
    filters: {
      mobile: 24,
      tablet: 24,
      desktop: 6,
      wide: 6,
      ultraWide: 6,
    },
    content: {
      mobile: 24,
      tablet: 24,
      desktop: 18,
      wide: 18,
      ultraWide: 18,
    },
  },

  // Form layouts
  form: {
    fullField: {
      mobile: 24,
      tablet: 24,
      desktop: 24,
      wide: 24,
      ultraWide: 24,
    },
    halfField: {
      mobile: 24,
      tablet: 12,
      desktop: 12,
      wide: 12,
      ultraWide: 12,
    },
    thirdField: {
      mobile: 24,
      tablet: 24,
      desktop: 8,
      wide: 8,
      ultraWide: 8,
    },
  },

  // Settings/Config page layouts
  settings: {
    navigation: {
      mobile: 24,
      tablet: 24,
      desktop: 6,
      wide: 6,
      ultraWide: 6,
    },
    content: {
      mobile: 24,
      tablet: 24,
      desktop: 18,
      wide: 18,
      ultraWide: 18,
    },
  },

  // Common component layouts (for widespread patterns found in analysis)
  common: {
    // Most common pattern: mobile={12} tablet={6} desktop={6} wide={6}
    metricCard: {
      mobile: 12,  // 2 per row on mobile
      tablet: 6,   // 4 per row on tablet  
      desktop: 6,  // 4 per row on desktop
      wide: 6,     // 4 per row on wide
      ultraWide: 6, // 4 per row on ultra-wide
    },
    
    // Second most common: mobile={24} tablet={12} desktop={12}
    formField: {
      mobile: 24,  // Full width on mobile
      tablet: 12,  // 2 per row on tablet
      desktop: 12, // 2 per row on desktop
      wide: 12,    // 2 per row on wide
      ultraWide: 12, // 2 per row on ultra-wide
    },
    
    // Third common: mobile={24} tablet={24} desktop={16} wide={16}
    mainChart: {
      mobile: 24,  // Full width on mobile
      tablet: 24,  // Full width on tablet
      desktop: 16, // 2/3 width on desktop
      wide: 16,    // 2/3 width on wide
      ultraWide: 16, // 2/3 width on ultra-wide
    },
    
    // Fourth common: mobile={24} tablet={24} desktop={8}
    sideWidget: {
      mobile: 24,  // Full width on mobile
      tablet: 24,  // Full width on tablet
      desktop: 8,  // 1/3 width on desktop
      wide: 8,     // 1/3 width on wide
      ultraWide: 8, // 1/3 width on ultra-wide
    },
    
    // Fifth pattern: mobile={12} tablet={6} desktop={6} wide={6} (4 per row on all except mobile)
    compactMetric: {
      mobile: 12,  // 2 per row on mobile
      tablet: 6,   // 4 per row on tablet
      desktop: 6,  // 4 per row on desktop
      wide: 6,     // 4 per row on wide
      ultraWide: 6, // 4 per row on ultra-wide
    },

    // Sixth pattern: mobile={24} tablet={12} desktop={6} (responsive breakpoints)
    responsiveMetric: {
      mobile: 24,  // Full width on mobile
      tablet: 12,  // 2 per row on tablet
      desktop: 6,  // 4 per row on desktop
      wide: 6,     // 4 per row on wide
      ultraWide: 6, // 4 per row on ultra-wide
    },

    // Seventh pattern: mobile={12} tablet={4} desktop={4} (6 per row)
    sixthWidth: {
      mobile: 12,  // 2 per row on mobile
      tablet: 4,   // 6 per row on tablet
      desktop: 4,  // 6 per row on desktop
      wide: 4,     // 6 per row on wide
      ultraWide: 4, // 6 per row on ultra-wide
    },

    // Pattern: mobile={24} tablet={16} desktop={18} (wide content)
    wideContent: {
      mobile: 24,
      tablet: 16, 
      desktop: 18,
      wide: 18,
      ultraWide: 18
    },

    // Pattern: mobile={24} tablet={8} desktop={6} (compact sidebar)
    compactSidebar: {
      mobile: 24,
      tablet: 8,
      desktop: 6,
      wide: 6,
      ultraWide: 6
    },

    // Pattern: mobile={18} tablet={18} desktop={18} (three quarters)
    threeQuarters: {
      mobile: 18,
      tablet: 18,
      desktop: 18,
      wide: 18,
      ultraWide: 18
    },

    // Pattern: mobile={6} tablet={6} desktop={6} (quarter)
    quarter: {
      mobile: 6,
      tablet: 6,
      desktop: 6,
      wide: 6,
      ultraWide: 6
    },

    // Pattern: mobile={24} tablet={24} desktop={12} (half width on desktop)
    halfWidth: {
      mobile: 24,
      tablet: 24,
      desktop: 12,
      wide: 12,
      ultraWide: 12
    },

    // Pattern: mobile={24} tablet={12} desktop={8} (one third responsive)
    oneThird: {
      mobile: 24,
      tablet: 12,
      desktop: 8,
      wide: 8,
      ultraWide: 8
    }
  },
} as const;

// Helper function to get layout config
export const getLayout = (layoutType: keyof typeof LAYOUT_CONFIG) => {
  return LAYOUT_CONFIG[layoutType];
};

// Helper function to get nested layout config
export const getDashboardLayout = (section: keyof typeof LAYOUT_CONFIG.dashboard) => {
  return LAYOUT_CONFIG.dashboard[section];
};

// Export type for TypeScript support
export type LayoutConfig = typeof LAYOUT_CONFIG;
export type ResponsiveLayout = {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
  ultraWide: number;
};