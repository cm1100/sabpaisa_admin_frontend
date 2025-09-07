/**
 * API Configuration for SabPaisa Admin Dashboard
 * Centralizes all API endpoint configurations following DRY principle
 */

export interface ApiEndpoint {
  url: string;
  timeout?: number;
  requiresAuth?: boolean;
  retries?: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  endpoints: {
    [key: string]: ApiEndpoint;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxRetries: number;
  };
  features: {
    realtime: boolean;
    bulkOperations: boolean;
    advancedSearch: boolean;
    pwa: boolean;
  };
  performance: {
    paginationSize: number;
    maxExportRecords: number;
    chartDataPoints: number;
  };
}

/**
 * Get API configuration from environment variables
 */
export const getApiConfig = (): ApiConfig => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

  return {
    baseURL,
    timeout,
    endpoints: {
      // Authentication - Django Backend
      login: {
        url: '/auth/login/',
        requiresAuth: false,
        timeout: 10000,
      },
      logout: {
        url: '/auth/logout/',
        requiresAuth: true,
      },
      refreshToken: {
        url: '/auth/refresh/',
        requiresAuth: false,
        timeout: 10000,
      },
      userProfile: {
        url: '/auth/user/',
        requiresAuth: true,
      },
      
      // Dashboard Metrics - Django Backend
      dashboardMetrics: {
        url: '/dashboard/metrics/',
        requiresAuth: true,
        timeout: 5000,
      },
      hourlyVolumeChart: {
        url: '/dashboard/charts/hourly/',
        requiresAuth: true,
        timeout: 5000,
      },
      paymentModeDistribution: {
        url: '/dashboard/charts/payment-modes/',
        requiresAuth: true,
      },
      topClients: {
        url: '/dashboard/charts/top-clients/',
        requiresAuth: true,
      },
      liveFeed: {
        url: '/dashboard/live-feed/',
        requiresAuth: true,
      },
      clientStats: {
        url: '/dashboard/client-stats/',
        requiresAuth: true,
      },
      systemHealth: {
        url: '/dashboard/health/',
        requiresAuth: true,
        timeout: 5000,
      },
      refreshMetrics: {
        url: '/dashboard/refresh/',
        requiresAuth: true,
      },
      
      // Transaction Management - Django Backend
      transactions: {
        url: '/transactions/',
        requiresAuth: true,
      },
      transactionDetails: {
        url: '/transactions/:id/',
        requiresAuth: true,
      },
      transactionStats: {
        url: '/transactions/stats/',
        requiresAuth: true,
      },
      transactionExport: {
        url: '/transactions/export/',
        requiresAuth: true,
        timeout: 60000,
      },
      analytics: {
        url: '/analytics/',
        requiresAuth: true,
      },
      
      // Refund Management - Django Backend
      refunds: {
        url: '/refunds/',
        requiresAuth: true,
      },
      refundCreate: {
        url: '/refunds/',
        requiresAuth: true,
      },
      refundApprove: {
        url: '/refunds/:id/approve/',
        requiresAuth: true,
      },

      // Dispute Management - Django Backend
      disputes: {
        url: '/disputes/',
        requiresAuth: true,
      },
      disputeCreate: {
        url: '/disputes/',
        requiresAuth: true,
      },

      // Settlement Management - Django Backend
      batches: {
        url: '/batches/',
        requiresAuth: true,
      },
      batchCreate: {
        url: '/batches/',
        requiresAuth: true,
      },
      batchProcess: {
        url: '/batches/:id/process/',
        requiresAuth: true,
        timeout: 120000,
      },
      batchDetails: {
        url: '/batches/:id/details/',
        requiresAuth: true,
      },
      configurations: {
        url: '/configurations/',
        requiresAuth: true,
      },
      configurationDetails: {
        url: '/configurations/:client_code/',
        requiresAuth: true,
      },
      reports: {
        url: '/reports/',
        requiresAuth: true,
      },
      reconciliations: {
        url: '/reconciliations/',
        requiresAuth: true,
      },

      // Client Management - Django Backend
      clients: {
        url: '/clients/',
        requiresAuth: true,
      },
      clientDetails: {
        url: '/clients/:id/',
        requiresAuth: true,
      },
      clientsStats: {
        url: '/clients/stats/',
        requiresAuth: true,
      },
    },
    
    websocket: {
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
      reconnectInterval: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_INTERVAL || '5000'),
      maxRetries: parseInt(process.env.NEXT_PUBLIC_WS_MAX_RETRIES || '5'),
    },
    
    features: {
      realtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
      bulkOperations: process.env.NEXT_PUBLIC_ENABLE_BULK_OPERATIONS === 'true',
      advancedSearch: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH === 'true',
      pwa: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    },
    
    performance: {
      paginationSize: parseInt(process.env.NEXT_PUBLIC_PAGINATION_SIZE || '50'),
      maxExportRecords: parseInt(process.env.NEXT_PUBLIC_MAX_EXPORT_RECORDS || '100000'),
      chartDataPoints: parseInt(process.env.NEXT_PUBLIC_CHART_DATA_POINTS || '100'),
    },
  };
};

/**
 * Get specific endpoint configuration
 */
export const getEndpoint = (endpointKey: string): ApiEndpoint | null => {
  const config = getApiConfig();
  return config.endpoints[endpointKey] || null;
};

/**
 * Build URL with parameters
 */
export const buildUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });
  return url;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof ApiConfig['features']): boolean => {
  const config = getApiConfig();
  return config.features[feature];
};

/**
 * Get WebSocket URL with authentication token
 */
export const getWebSocketUrl = (token?: string): string => {
  const config = getApiConfig();
  const wsUrl = new URL(config.websocket.url);
  
  if (token) {
    wsUrl.searchParams.append('token', token);
  }
  
  return wsUrl.toString();
};

// Export the configuration instance
export const apiConfig = getApiConfig();
