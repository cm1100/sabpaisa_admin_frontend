/**
 * Settlement Store using Zustand
 * Following SOLID principles and project patterns
 * Single Responsibility: Manages settlement state only
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  settlementApiService,
  SettlementBatch,
  SettlementDetail,
  SettlementStatistics,
  SettlementConfiguration,
  SettlementReconciliation,
  SettlementReport,
  SettlementFilter
} from '@/services/api/SettlementApiService';
import { message } from '@/components/ui';

interface SettlementActivity {
  activity_type: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: string;
}

interface CycleDistribution {
  cycle: string;
  count: number;
  amount: number;
  percentage: number;
}

interface SettlementState {
  // Data
  batches: SettlementBatch[];
  currentBatch: SettlementBatch | null;
  settlementDetails: SettlementDetail[];
  statistics: SettlementStatistics | null;
  configurations: SettlementConfiguration[];
  reconciliations: SettlementReconciliation[];
  reports: SettlementReport[];
  activities: SettlementActivity[];
  cycleDistribution: CycleDistribution[];
  
  // UI State
  isLoading: boolean;
  isProcessing: boolean;
  isCreatingBatch: boolean;
  selectedBatchId: string | null;
  filter: SettlementFilter;
  error: string | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Actions - Following Interface Segregation Principle
  // Batch Operations
  fetchBatches: (filter?: SettlementFilter) => Promise<void>;
  fetchBatchDetails: (batchId: string) => Promise<void>;
  createBatch: (date?: string) => Promise<SettlementBatch | null>;
  processBatch: (batchId: string) => Promise<void>;
  approveBatch: (batchId: string, notes?: string) => Promise<void>;
  cancelBatch: (batchId: string, reason: string) => Promise<void>;
  
  // Settlement Operations
  fetchSettlementDetails: (batchId: string) => Promise<void>;
  retrySettlement: (settlementId: string) => Promise<void>;
  bulkProcessSettlements: (settlementIds: string[]) => Promise<void>;
  
  // Statistics & Analytics
  fetchStatistics: (filter?: SettlementFilter) => Promise<void>;
  fetchActivities: (limit?: number) => Promise<void>;
  fetchCycleDistribution: () => Promise<void>;
  
  // Configuration Operations
  fetchConfigurations: (clientCode?: string) => Promise<void>;
  updateConfiguration: (configId: string, data: Partial<SettlementConfiguration>) => Promise<void>;
  
  // Report Operations
  generateReport: (type: string, dateFrom: string, dateTo: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  downloadReport: (reportId: string) => Promise<void>;
  
  // Reconciliation Operations
  createReconciliation: (batchId: string, amount: number, remarks?: string) => Promise<void>;
  fetchReconciliations: (filter?: any) => Promise<void>;
  updateReconciliation: (id: string, status: string, remarks?: string) => Promise<void>;
  
  // Export Operations
  exportSettlements: (format: 'csv' | 'xlsx') => Promise<void>;
  
  // UI State Management
  setFilter: (filter: SettlementFilter) => void;
  setSelectedBatch: (batchId: string | null) => void;
  clearError: () => void;
  resetState: () => void;
}

const initialState = {
  batches: [] as SettlementBatch[],
  currentBatch: null as SettlementBatch | null,
  settlementDetails: [] as SettlementDetail[],
  statistics: null as SettlementStatistics | null,
  configurations: [] as SettlementConfiguration[],
  reconciliations: [] as SettlementReconciliation[],
  reports: [] as SettlementReport[],
  activities: [] as SettlementActivity[],
  cycleDistribution: [] as CycleDistribution[],
  isLoading: false,
  isProcessing: false,
  isCreatingBatch: false,
  selectedBatchId: null as string | null,
  filter: {} as SettlementFilter,
  error: null as string | null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
};

export const useSettlementStore = create<SettlementState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Batch Operations
        fetchBatches: async (filter = {}) => {
          set({ isLoading: true, error: null });
          try {
            const response = await settlementApiService.getSettlementBatches(filter);
            set({ 
              batches: response.results,
              totalCount: response.count,
              filter,
              isLoading: false 
            });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch settlement batches';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        fetchBatchDetails: async (batchId: string) => {
          set({ isLoading: true, error: null });
          try {
            const batch = await settlementApiService.getSettlementBatch(batchId);
            set({ currentBatch: batch, selectedBatchId: batchId, isLoading: false });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch batch details';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        createBatch: async (date?: string) => {
          set({ isCreatingBatch: true, error: null });
          try {
            const batch = await settlementApiService.createSettlementBatch({ 
              batch_date: date 
            });
            
            // Update local state
            const { batches } = get();
            set({ 
              batches: [batch, ...batches],
              currentBatch: batch,
              isCreatingBatch: false 
            });
            
            message.success('Settlement batch created successfully');
            return batch;
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to create settlement batch';
            set({ error: errorMessage, isCreatingBatch: false });
            message.error(errorMessage);
            return null;
          }
        },
        
        processBatch: async (batchId: string) => {
          set({ isProcessing: true, error: null });
          try {
            const batch = await settlementApiService.processSettlementBatch(batchId);
            
            // Update batch in list
            const { batches } = get();
            const updatedBatches = batches.map(b => 
              b.batch_id === batchId ? batch : b
            );
            
            set({ 
              batches: updatedBatches,
              currentBatch: batch,
              isProcessing: false 
            });
            
            message.success('Settlement batch processed successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to process settlement batch';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        approveBatch: async (batchId: string, notes?: string) => {
          set({ isProcessing: true, error: null });
          try {
            const batch = await settlementApiService.approveSettlementBatch(batchId, notes);
            
            // Update batch in list
            const { batches } = get();
            const updatedBatches = batches.map(b => 
              b.batch_id === batchId ? batch : b
            );
            
            set({ 
              batches: updatedBatches,
              currentBatch: batch,
              isProcessing: false 
            });
            
            message.success('Settlement batch approved successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to approve settlement batch';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        cancelBatch: async (batchId: string, reason: string) => {
          set({ isProcessing: true, error: null });
          try {
            const batch = await settlementApiService.cancelSettlementBatch(batchId, reason);
            
            // Update batch in list
            const { batches } = get();
            const updatedBatches = batches.map(b => 
              b.batch_id === batchId ? batch : b
            );
            
            set({ 
              batches: updatedBatches,
              currentBatch: batch,
              isProcessing: false 
            });
            
            message.warning('Settlement batch cancelled');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to cancel settlement batch';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        // Settlement Operations
        fetchSettlementDetails: async (batchId: string) => {
          set({ isLoading: true, error: null });
          try {
            const details = await settlementApiService.getSettlementDetails(batchId);
            set({ settlementDetails: details, isLoading: false });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch settlement details';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        retrySettlement: async (settlementId: string) => {
          set({ isProcessing: true, error: null });
          try {
            await settlementApiService.retrySettlement(settlementId);
            
            // Refresh current batch details
            const { selectedBatchId } = get();
            if (selectedBatchId) {
              await get().fetchSettlementDetails(selectedBatchId);
            }
            
            set({ isProcessing: false });
            message.success('Settlement retry initiated');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to retry settlement';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        bulkProcessSettlements: async (settlementIds: string[]) => {
          set({ isProcessing: true, error: null });
          try {
            const result = await settlementApiService.bulkProcessSettlements(settlementIds);
            
            // Refresh batches
            await get().fetchBatches(get().filter);
            
            set({ isProcessing: false });
            message.success(`Processed ${result.processed} settlements successfully`);
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to process settlements';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        // Statistics & Analytics
        fetchStatistics: async (filter = {}) => {
          try {
            const statistics = await settlementApiService.getSettlementStatistics(filter);
            set({ statistics });
          } catch (error: any) {
            console.error('Failed to fetch statistics:', error);
          }
        },
        
        fetchActivities: async (limit = 10) => {
          try {
            const activities = await settlementApiService.getSettlementActivity(limit);
            set({ activities });
          } catch (error: any) {
            console.error('Failed to fetch activities:', error);
          }
        },
        
        fetchCycleDistribution: async () => {
          try {
            const cycleDistribution = await settlementApiService.getCycleDistribution();
            set({ cycleDistribution });
          } catch (error: any) {
            console.error('Failed to fetch cycle distribution:', error);
          }
        },
        
        // Configuration Operations
        fetchConfigurations: async (clientCode?: string) => {
          set({ isLoading: true, error: null });
          try {
            const configurations = await settlementApiService.getSettlementConfigurations(clientCode);
            set({ configurations, isLoading: false });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch configurations';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        updateConfiguration: async (configId: string, data: Partial<SettlementConfiguration>) => {
          set({ isProcessing: true, error: null });
          try {
            const config = await settlementApiService.updateSettlementConfiguration(configId, data);
            
            // Update configuration in list
            const { configurations } = get();
            const updatedConfigs = configurations.map(c => 
              c.config_id === configId ? config : c
            );
            
            set({ 
              configurations: updatedConfigs,
              isProcessing: false 
            });
            
            message.success('Configuration updated successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to update configuration';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        // Report Operations
        generateReport: async (type: string, dateFrom: string, dateTo: string) => {
          set({ isProcessing: true, error: null });
          try {
            const report = await settlementApiService.generateSettlementReport({
              report_type: type,
              date_from: dateFrom,
              date_to: dateTo
            });
            
            // Add to reports list
            const { reports } = get();
            set({ 
              reports: [report, ...reports],
              isProcessing: false 
            });
            
            message.success('Report generated successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to generate report';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        fetchReports: async () => {
          set({ isLoading: true, error: null });
          try {
            const reports = await settlementApiService.getSettlementReports();
            set({ reports, isLoading: false });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch reports';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        downloadReport: async (reportId: string) => {
          try {
            const blob = await settlementApiService.downloadSettlementReport(reportId);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `settlement-report-${reportId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.success('Report downloaded successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to download report';
            message.error(errorMessage);
          }
        },
        
        // Reconciliation Operations
        createReconciliation: async (batchId: string, amount: number, remarks?: string) => {
          set({ isProcessing: true, error: null });
          try {
            const reconciliation = await settlementApiService.createReconciliation({
              batch_id: batchId,
              bank_statement_amount: amount,
              remarks
            });
            
            // Add to reconciliations list
            const { reconciliations } = get();
            set({ 
              reconciliations: [reconciliation, ...reconciliations],
              isProcessing: false 
            });
            
            message.success('Reconciliation created successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to create reconciliation';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        fetchReconciliations: async (filter = {}) => {
          set({ isLoading: true, error: null });
          try {
            const reconciliations = await settlementApiService.getReconciliations(filter);
            set({ reconciliations, isLoading: false });
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to fetch reconciliations';
            set({ error: errorMessage, isLoading: false });
            message.error(errorMessage);
          }
        },
        
        updateReconciliation: async (id: string, status: string, remarks?: string) => {
          set({ isProcessing: true, error: null });
          try {
            const reconciliation = await settlementApiService.updateReconciliation(id, {
              status,
              remarks
            });
            
            // Update reconciliation in list
            const { reconciliations } = get();
            const updatedReconciliations = reconciliations.map(r => 
              r.reconciliation_id === id ? reconciliation : r
            );
            
            set({ 
              reconciliations: updatedReconciliations,
              isProcessing: false 
            });
            
            message.success('Reconciliation updated successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to update reconciliation';
            set({ error: errorMessage, isProcessing: false });
            message.error(errorMessage);
          }
        },
        
        // Export Operations
        exportSettlements: async (format: 'csv' | 'xlsx') => {
          try {
            const { filter } = get();
            const blob = await settlementApiService.exportSettlements({ ...filter, format });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `settlements-export.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.success('Export downloaded successfully');
          } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.error || 'Failed to export settlements';
            message.error(errorMessage);
          }
        },
        
        // UI State Management
        setFilter: (filter: SettlementFilter) => {
          set({ filter });
        },
        
        setSelectedBatch: (batchId: string | null) => {
          set({ selectedBatchId: batchId });
        },
        
        clearError: () => {
          set({ error: null });
        },
        
        resetState: () => {
          set(initialState);
        }
      }),
      {
        name: 'settlement-storage',
        partialize: (state) => ({
          filter: state.filter,
          pageSize: state.pageSize
        })
      }
    )
  )
);
