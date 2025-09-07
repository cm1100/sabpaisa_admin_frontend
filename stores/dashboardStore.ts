/**
 * Dashboard Store using Zustand
 * Manages global dashboard state
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { dashboardService } from '@/services/api/DashboardApiService';
import type { DashboardMetrics as ApiDashboardMetrics } from '@/services/api/DashboardApiService';

type DashboardMetrics = ApiDashboardMetrics;

interface TrendData {
  current: number;
  previous: number;
  trend: number;
}

interface DashboardState {
  // Metrics
  metrics: DashboardMetrics | null;
  trends: {
    transactions: TrendData;
    volume: TrendData;
    successRate: TrendData;
  } | null;
  hourlyData: any[];
  paymentMethods: any[];
  topClients: any[];
  recentAlerts: any[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Time range
  timeRange: '24h' | '7d' | '30d' | '90d';
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  setTimeRange: (range: '24h' | '7d' | '30d' | '90d') => void;
  clearError: () => void;
  clearDashboardData: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        metrics: null,
        trends: null,
        hourlyData: [],
        paymentMethods: [],
        topClients: [],
        recentAlerts: [],
        isLoading: false,
        isRefreshing: false,
        error: null,
        timeRange: '24h',
        
        // Fetch dashboard data
        fetchDashboardData: async () => {
          const { isLoading, timeRange } = get();
          if (isLoading) return;
          
          set({ isLoading: true, error: null });
          
          // Convert time range to hours for the chart
          const hoursMap: Record<string, number> = {
            '24h': 24,
            '7d': 168,  // 7 * 24
            '30d': 720, // 30 * 24
            '90d': 2160 // 90 * 24
          };
          const hours = hoursMap[timeRange] || 24;
          
          try {
            // Try to fetch real API data
            const [metricsResponse, hourlyData, paymentMethods, topClients] = await Promise.all([
              dashboardService.getDashboardMetrics(timeRange),
              dashboardService.getHourlyVolumeChart(hours),
              dashboardService.getPaymentMethodDistribution(timeRange),
              dashboardService.getTopClientsChart(10, timeRange)
            ]);
            
            set({
              metrics: metricsResponse ?? null,
              trends: null, // Will be handled by Django API response
              hourlyData: Array.isArray(hourlyData) ? hourlyData : (hourlyData.data || []),
              paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : (paymentMethods.data || []),
              topClients: Array.isArray(topClients) ? topClients : (topClients.data || []),
              recentAlerts: [],
              isLoading: false,
            });
          } catch (error) {
            console.error('Dashboard API error:', error);
            set({ error: 'Failed to fetch dashboard data', isLoading: false });
          }
        },
        
        // Refresh dashboard data (without showing loading state)
        refreshDashboardData: async () => {
          const { timeRange } = get();
          set({ isRefreshing: true });
          
          // Convert time range to hours for the chart
          const hoursMap: Record<string, number> = {
            '24h': 24,
            '7d': 168,  // 7 * 24
            '30d': 720, // 30 * 24
            '90d': 2160 // 90 * 24
          };
          const hours = hoursMap[timeRange] || 24;
          
          try {
            // Try to fetch real API data
            const [metricsResponse, hourlyData, paymentMethods, topClients] = await Promise.all([
              dashboardService.getDashboardMetrics(timeRange),
              dashboardService.getHourlyVolumeChart(hours),
              dashboardService.getPaymentMethodDistribution(timeRange),
              dashboardService.getTopClientsChart(10, timeRange)
            ]);
            
            set({
              metrics: metricsResponse ?? null,
              trends: null, // Will be handled by Django API response
              hourlyData: Array.isArray(hourlyData) ? hourlyData : (hourlyData.data || []),
              paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : (paymentMethods.data || []),
              topClients: Array.isArray(topClients) ? topClients : (topClients.data || []),
              recentAlerts: [],
              isRefreshing: false,
            });
          } catch (error) {
            console.error('Dashboard refresh error:', error);
            set({ error: 'Failed to refresh dashboard data', isRefreshing: false });
          }
        },
        
        // Set time range
        setTimeRange: (range) => {
          set({ timeRange: range });
          get().fetchDashboardData();
        },
        
        // Clear error
        clearError: () => set({ error: null }),
        
        // Clear dashboard data (for logout)
        clearDashboardData: () => {
          set({
            metrics: null,
            trends: null,
            recentAlerts: [],
            hourlyData: [],
            paymentMethods: [],
            topClients: [],
            isLoading: false,
            isRefreshing: false,
            error: null,
          });
        },
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({
          timeRange: state.timeRange,
        }),
      }
    )
  )
);
