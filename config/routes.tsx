/**
 * Route configuration for ProLayout
 * Based on UX requirements for all user personas
 */
import {
  DashboardOutlined,
  TeamOutlined,
  TransactionOutlined,
  WalletOutlined,
  SettingOutlined,
  SafetyOutlined,
  FileTextOutlined,
  ApiOutlined,
  BellOutlined,
  AuditOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  BankOutlined,
  CalculatorOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  ExceptionOutlined,
  CalendarOutlined,
  ReconciliationOutlined,
  SolutionOutlined,
  CrownOutlined,
  StarOutlined,
  CreditCardOutlined,
  ExperimentOutlined,
  HeatMapOutlined,
  BuildOutlined,
  ScheduleOutlined,
  ExportOutlined,
  KeyOutlined,
  MonitorOutlined,
  AlertOutlined,
  UserOutlined,
  HistoryOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';

export interface RouteConfig {
  path: string;
  name: string;
  icon?: React.ReactNode;
  component?: string;
  routes?: RouteConfig[];
  hideInMenu?: boolean;
  access?: string[];
  badge?: number | string;
  target?: string;
}

export const routes: RouteConfig[] = [
  // Dashboard Section - For all personas
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
    routes: [
      {
        path: '/dashboard/overview',
        name: 'Overview',
        icon: <BarChartOutlined />,
        component: './Dashboard',
      },
      {
        path: '/dashboard/operations',
        name: 'Operations',
        icon: <ControlOutlined />,
        component: './Dashboard/Operations',
        access: ['operations_manager'],
      },
      {
        path: '/dashboard/analytics',
        name: 'Analytics',
        icon: <BarChartOutlined />,
        component: './Dashboard/Analytics',
      },
      {
        path: '/dashboard/realtime',
        name: 'Real-time Monitor',
        icon: <ThunderboltOutlined />,
        component: './Dashboard/Realtime',
        badge: 'LIVE',
      },
    ],
  },

  // Client Management - For Configuration Manager
  {
    path: '/clients',
    name: 'Clients',
    icon: <TeamOutlined />,
    routes: [
      {
        path: '/clients/list',
        name: 'All Clients',
        component: './Clients',
      },
      {
        path: '/clients/new',
        name: 'Onboard Client',
        icon: <SolutionOutlined />,
        component: './Clients/New',
      },
      {
        path: '/clients/kyc',
        name: 'KYC Verification',
        icon: <SafetyOutlined />,
        component: './Clients/KYC',
      },
      {
        path: '/clients/bulk',
        name: 'Bulk Upload',
        icon: <CloudUploadOutlined />,
        component: './Clients/BulkUpload',
      },
      {
        path: '/clients/:id',
        name: 'Client Details',
        component: './Clients/Details',
        hideInMenu: true,
      },
    ],
  },

  // Transaction Management - For Operations Manager
  {
    path: '/transactions',
    name: 'Transactions',
    icon: <TransactionOutlined />,
    // no static badge counts
    routes: [
      {
        path: '/transactions/all',
        name: 'All Transactions',
        component: './Transactions',
      },
      {
        path: '/transactions/live',
        name: 'Live Monitor',
        icon: <ThunderboltOutlined />,
        component: './Transactions/Live',
      },
      {
        path: '/transactions/refunds',
        name: 'Refunds',
        icon: <TransactionOutlined />,
        component: './Transactions/Refunds',
      },
      {
        path: '/transactions/failed',
        name: 'Failed Transactions',
        icon: <ExceptionOutlined />,
        component: './Transactions/Failed',
      },
      {
        path: '/transactions/exceptions',
        name: 'Exception Queue',
        icon: <ExceptionOutlined />,
        component: './Transactions/Exceptions',
        access: ['operations_manager'],
      },
      {
        path: '/transactions/:id',
        name: 'Transaction Details',
        component: './Transactions/Details',
        hideInMenu: true,
      },
    ],
  },

  // Settlement Processing - For Settlement Admin
  {
    path: '/settlements',
    name: 'Settlements',
    icon: <WalletOutlined />,
    routes: [
      {
        path: '/settlements/overview',
        name: 'Overview',
        component: './Settlements',
      },
      {
        path: '/settlements/calendar',
        name: 'Settlement Calendar',
        icon: <CalendarOutlined />,
        component: './Settlements/Calendar',
      },
      {
        path: '/settlements/process',
        name: 'Process Queue',
        icon: <ReconciliationOutlined />,
        component: './Settlements/Process',
      },
      {
        path: '/settlements/reconciliation',
        name: 'Reconciliation',
        icon: <ReconciliationOutlined />,
        component: './Settlements/Reconciliation',
        access: ['settlement_admin'],
      },
      {
        path: '/settlements/bank-wise',
        name: 'Bank-wise Status',
        icon: <BankOutlined />,
        component: './Settlements/BankWise',
      },
      {
        path: '/settlements/disputes',
        name: 'Dispute Resolution',
        icon: <ExceptionOutlined />,
        component: './Settlements/Disputes',
      },
    ],
  },

  // Configuration - For Configuration Manager
  {
    path: '/config',
    name: 'Configuration',
    icon: <SettingOutlined />,
    routes: [
      {
        path: '/config/fees',
        name: 'Fee Structure',
        icon: <CalculatorOutlined />,
        component: './Config/Fees',
      },
      {
        path: '/config/payment-methods',
        name: 'Payment Methods',
        icon: <CreditCardOutlined />,
        component: './Config/PaymentMethods',
      },
      {
        path: '/config/gateways',
        name: 'Gateway Routing',
        icon: <GlobalOutlined />,
        component: './Config/Gateways',
      },
      {
        path: '/config/templates',
        name: 'Templates',
        icon: <FileTextOutlined />,
        component: './Config/Templates',
      },
      {
        path: '/config/sandbox',
        name: 'Testing Sandbox',
        icon: <ExperimentOutlined />,
        component: './Config/Sandbox',
        access: ['configuration_manager'],
      },
    ],
  },

  // Compliance & Audit - For Compliance Officer
  {
    path: '/compliance',
    name: 'Compliance',
    icon: <AuditOutlined />,
    routes: [
      {
        path: '/compliance/dashboard',
        name: 'Dashboard',
        component: './Compliance',
      },
      {
        path: '/compliance/reports',
        name: 'Reports',
        icon: <FileTextOutlined />,
        component: './Compliance/Reports',
      },
      {
        path: '/compliance/audit-trail',
        name: 'Audit Trail',
        icon: <AuditOutlined />,
        component: './Compliance/AuditTrail',
      },
      {
        path: '/compliance/risk-assessment',
        name: 'Risk Heat Map',
        icon: <HeatMapOutlined />,
        component: './Compliance/RiskAssessment',
      },
      {
        path: '/compliance/documents',
        name: 'Documents',
        icon: <FileTextOutlined />,
        component: './Compliance/Documents',
      },
      {
        path: '/compliance/calendar',
        name: 'Regulatory Calendar',
        icon: <CalendarOutlined />,
        component: './Compliance/Calendar',
      },
    ],
  },

  // Reports & Analytics
  {
    path: '/reports',
    name: 'Reports',
    icon: <FileTextOutlined />,
    routes: [
      {
        path: '/reports/builder',
        name: 'Report Builder',
        icon: <BuildOutlined />,
        component: './Reports/Builder',
      },
      {
        path: '/reports/scheduled',
        name: 'Scheduled Reports',
        icon: <ScheduleOutlined />,
        component: './Reports/Scheduled',
      },
      {
        path: '/reports/templates',
        name: 'Templates',
        icon: <FileTextOutlined />,
        component: './Reports/Templates',
      },
      {
        path: '/reports/export',
        name: 'Export Center',
        icon: <ExportOutlined />,
        component: './Reports/Export',
      },
    ],
  },

  // Integration & API
  {
    path: '/integration',
    name: 'Integration',
    icon: <ApiOutlined />,
    routes: [
      {
        path: '/integration/webhooks',
        name: 'Webhooks',
        icon: <ApiOutlined />,
        component: './Integration/Webhooks',
      },
      {
        path: '/integration/api-keys',
        name: 'API Keys',
        icon: <KeyOutlined />,
        component: './Integration/ApiKeys',
      },
      {
        path: '/integration/health',
        name: 'Health Monitor',
        icon: <MonitorOutlined />,
        component: './Integration/Health',
      },
      {
        path: '/integration/logs',
        name: 'API Logs',
        icon: <FileTextOutlined />,
        component: './Integration/Logs',
      },
    ],
  },

  // Notifications
  {
    path: '/notifications',
    name: 'Notifications',
    icon: <BellOutlined />,
    // no static badge counts
    routes: [
      {
        path: '/notifications/all',
        name: 'All Notifications',
        component: './Notifications',
      },
      {
        path: '/notifications/alerts',
        name: 'System Alerts',
        icon: <AlertOutlined />,
        component: './Notifications/Alerts',
      },
      {
        path: '/notifications/settings',
        name: 'Settings',
        icon: <SettingOutlined />,
        component: './Notifications/Settings',
      },
    ],
  },

  // System Administration
  {
    path: '/admin',
    name: 'Administration',
    icon: <ControlOutlined />,
    access: ['admin'],
    routes: [
      {
        path: '/admin/users',
        name: 'User Management',
        icon: <UserOutlined />,
        component: './Admin/Users',
      },
      {
        path: '/admin/roles',
        name: 'Roles & Permissions',
        icon: <SafetyOutlined />,
        component: './Admin/Roles',
      },
      {
        path: '/admin/activity',
        name: 'Activity Logs',
        icon: <HistoryOutlined />,
        component: './Admin/Activity',
      },
      {
        path: '/admin/system',
        name: 'System Settings',
        icon: <SettingOutlined />,
        component: './Admin/System',
      },
      {
        path: '/admin/backup',
        name: 'Backup & Restore',
        icon: <CloudDownloadOutlined />,
        component: './Admin/Backup',
      },
    ],
  },

  // User Account
  {
    path: '/account',
    name: 'Account',
    icon: <UserOutlined />,
    hideInMenu: true,
    routes: [
      {
        path: '/account/profile',
        name: 'Profile',
        component: './Account/Profile',
      },
      {
        path: '/account/security',
        name: 'Security',
        component: './Account/Security',
      },
      {
        path: '/account/preferences',
        name: 'Preferences',
        component: './Account/Preferences',
      },
    ],
  },
];


// Helper function to get flattened routes for breadcrumb
export const getFlattenRoutes = (routeList: RouteConfig[] = []): RouteConfig[] => {
  const result: RouteConfig[] = [];
  
  const flatten = (routes: RouteConfig[], parent?: string) => {
    routes.forEach(route => {
      const path = parent ? `${parent}${route.path}` : route.path;
      result.push({ ...route, path });
      
      if (route.routes) {
        flatten(route.routes, path);
      }
    });
  };
  
  flatten(routeList);
  return result;
};

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  const flattenRoutes = getFlattenRoutes(routes);
  return flattenRoutes.find(route => route.path === path);
};

// Check if user has access to route
export const hasAccess = (route: RouteConfig, userRoles: string[]): boolean => {
  if (!route.access || route.access.length === 0) {
    return true;
  }
  
  return route.access.some(role => userRoles.includes(role));
};
