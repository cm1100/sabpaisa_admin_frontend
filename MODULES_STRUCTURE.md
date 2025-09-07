# SabPaisa Admin Dashboard - Module Structure Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Complete Module Hierarchy](#complete-module-hierarchy)
- [Module Details](#module-details)
- [Access Control Matrix](#access-control-matrix)
- [Badge System](#badge-system)
- [Navigation Flow](#navigation-flow)

## Overview

The SabPaisa Admin Dashboard is organized into 11 primary modules, each serving specific user personas and business functions. This document provides a complete reference for all modules, sub-modules, and their features.

## Complete Module Hierarchy

```
SabPaisa Admin
│
├── 📊 Dashboard
│   ├── Overview
│   ├── Operations (Role: operations_manager)
│   ├── Analytics
│   └── Real-time Monitor [LIVE]
│
├── 👥 Clients
│   ├── All Clients [15K+]
│   ├── Onboard Client
│   ├── KYC Verification [23]
│   ├── Bulk Upload
│   └── [Client Details] (hidden)
│
├── 💳 Transactions [1.5M]
│   ├── All Transactions
│   ├── Live Monitor [LIVE]
│   ├── Refunds [12]
│   ├── Failed Transactions [45]
│   ├── Exception Queue (Role: operations_manager)
│   └── [Transaction Details] (hidden)
│
├── 💰 Settlements
│   ├── Overview
│   ├── Settlement Calendar
│   ├── Process Queue [28]
│   ├── Reconciliation (Role: settlement_admin)
│   ├── Bank-wise Status
│   └── Dispute Resolution [5]
│
├── ⚙️ Configuration
│   ├── Fee Structure
│   ├── Payment Methods
│   ├── Gateway Routing
│   ├── Templates
│   └── Testing Sandbox (Role: configuration_manager)
│
├── 🛡️ Compliance
│   ├── Dashboard
│   ├── Reports
│   ├── Audit Trail
│   ├── Risk Heat Map
│   ├── Documents
│   └── Regulatory Calendar [3]
│
├── 📈 Reports
│   ├── Report Builder
│   ├── Scheduled Reports
│   ├── Templates
│   └── Export Center
│
├── 🔌 Integration
│   ├── Webhooks
│   ├── API Keys
│   ├── Health Monitor
│   └── API Logs
│
├── 🔔 Notifications [8]
│   ├── All Notifications
│   ├── System Alerts [3]
│   └── Settings
│
├── 🎛️ Administration (Role: admin)
│   ├── User Management
│   ├── Roles & Permissions
│   ├── Activity Logs
│   ├── System Settings
│   └── Backup & Restore
│
└── 👤 Account (hidden from menu)
    ├── Profile
    ├── Security
    └── Preferences
```

## Module Details

### 1. Dashboard Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Overview | `/dashboard/overview` | Main dashboard with KPIs | All | - |
| Operations | `/dashboard/operations` | Operations-specific metrics | operations_manager | - |
| Analytics | `/dashboard/analytics` | Data analytics and trends | All | - |
| Real-time Monitor | `/dashboard/realtime` | Live transaction monitoring | All | LIVE |

**Key Features:**
- Real-time transaction volume tracking
- Success rate monitoring
- Client activity dashboard
- Revenue analytics
- System health indicators

### 2. Clients Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| All Clients | `/clients/list` | Client management list | All | 15K+ |
| Onboard Client | `/clients/new` | New client registration | All | - |
| KYC Verification | `/clients/kyc` | Document verification | All | 23 |
| Bulk Upload | `/clients/bulk` | CSV/Excel import | All | - |
| Client Details | `/clients/:id` | Individual client view | All | - |

**Key Features:**
- Client onboarding workflow
- KYC document management
- Tier management (Basic/Standard/Premium/Enterprise)
- API credential generation
- Client performance metrics

### 3. Transactions Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| All Transactions | `/transactions/all` | Transaction history | All | - |
| Live Monitor | `/transactions/live` | Real-time stream | All | LIVE |
| Refunds | `/transactions/refunds` | Refund processing | All | 12 |
| Failed Transactions | `/transactions/failed` | Failed payment handling | All | 45 |
| Exception Queue | `/transactions/exceptions` | Exception handling | operations_manager | - |
| Transaction Details | `/transactions/:id` | Individual transaction | All | - |

**Key Features:**
- Advanced filtering and search
- Bulk refund processing
- Exception management
- Transaction lifecycle tracking
- Payment method analytics

### 4. Settlements Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Overview | `/settlements/overview` | Settlement dashboard | All | - |
| Settlement Calendar | `/settlements/calendar` | Visual schedule | All | - |
| Process Queue | `/settlements/process` | Pending settlements | All | 28 |
| Reconciliation | `/settlements/reconciliation` | Bank reconciliation | settlement_admin | - |
| Bank-wise Status | `/settlements/bank-wise` | Multi-bank tracking | All | - |
| Dispute Resolution | `/settlements/disputes` | Dispute management | All | 5 |

**Key Features:**
- Automated settlement processing
- Multi-bank support
- Reconciliation workflows
- Dispute case management
- Settlement report generation

### 5. Configuration Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Fee Structure | `/config/fees` | MDR configuration | All | - |
| Payment Methods | `/config/payment-methods` | Gateway settings | All | - |
| Gateway Routing | `/config/gateways` | Smart routing rules | All | - |
| Templates | `/config/templates` | Email/SMS templates | All | - |
| Testing Sandbox | `/config/sandbox` | API testing | configuration_manager | - |

**Key Features:**
- Dynamic fee configuration
- Payment method management
- Smart routing algorithms
- Template customization
- Sandbox environment for testing

### 6. Compliance Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Dashboard | `/compliance/dashboard` | Compliance overview | All | - |
| Reports | `/compliance/reports` | Regulatory reports | All | - |
| Audit Trail | `/compliance/audit-trail` | System audit logs | All | - |
| Risk Heat Map | `/compliance/risk-assessment` | Risk visualization | All | - |
| Documents | `/compliance/documents` | Compliance docs | All | - |
| Regulatory Calendar | `/compliance/calendar` | Compliance dates | All | 3 |

**Key Features:**
- Automated compliance reporting
- Comprehensive audit trails
- Risk assessment tools
- Document management
- Regulatory deadline tracking

### 7. Reports Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Report Builder | `/reports/builder` | Custom reports | All | - |
| Scheduled Reports | `/reports/scheduled` | Automated reports | All | - |
| Templates | `/reports/templates` | Report templates | All | - |
| Export Center | `/reports/export` | Bulk data export | All | - |

**Key Features:**
- Drag-and-drop report builder
- Scheduling automation
- Multiple export formats (CSV, Excel, PDF)
- Template library
- Real-time data refresh

### 8. Integration Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Webhooks | `/integration/webhooks` | Webhook config | All | - |
| API Keys | `/integration/api-keys` | Key management | All | - |
| Health Monitor | `/integration/health` | System health | All | - |
| API Logs | `/integration/logs` | Request logs | All | - |

**Key Features:**
- Webhook configuration
- API key generation and rotation
- System health monitoring
- API request/response logging
- Rate limiting configuration

### 9. Notifications Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| All Notifications | `/notifications/all` | Notification center | All | - |
| System Alerts | `/notifications/alerts` | Critical alerts | All | 3 |
| Settings | `/notifications/settings` | Preferences | All | - |

**Key Features:**
- Real-time notifications
- Alert prioritization
- Channel preferences (Email/SMS/Push)
- Notification history
- Alert thresholds configuration

### 10. Administration Module

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| User Management | `/admin/users` | User administration | admin | - |
| Roles & Permissions | `/admin/roles` | RBAC configuration | admin | - |
| Activity Logs | `/admin/activity` | User activity | admin | - |
| System Settings | `/admin/system` | Global settings | admin | - |
| Backup & Restore | `/admin/backup` | Data backup | admin | - |

**Key Features:**
- User lifecycle management
- Role-based access control
- Activity monitoring
- System configuration
- Automated backup scheduling

### 11. Account Module (Hidden)

| Sub-Module | Path | Description | Access | Badge |
|------------|------|-------------|--------|-------|
| Profile | `/account/profile` | User profile | All | - |
| Security | `/account/security` | Security settings | All | - |
| Preferences | `/account/preferences` | User preferences | All | - |

**Key Features:**
- Profile management
- Password change
- Two-factor authentication
- Theme preferences
- Language settings

## Access Control Matrix

| Role | Modules Access |
|------|---------------|
| **All Users** | Dashboard (Overview, Analytics, Real-time), Clients, Transactions (basic), Settlements (overview), Configuration (view), Compliance, Reports, Integration, Notifications, Account |
| **operations_manager** | + Dashboard > Operations, Transactions > Exception Queue |
| **settlement_admin** | + Settlements > Reconciliation |
| **configuration_manager** | + Configuration > Testing Sandbox |
| **compliance_officer** | Full Compliance module with write access |
| **admin** | + Full Administration module |
| **super_admin** | All modules with full access |

## Badge System

### Real-time Indicators
- **LIVE** - Real-time data streams
- **Numbers** - Pending items count
- **15K+** - Total count indicators

### Badge Types

| Badge Type | Meaning | Update Frequency |
|-----------|---------|-----------------|
| LIVE | Real-time streaming data | Continuous |
| Numeric (e.g., 23) | Pending items requiring action | Every 30 seconds |
| Count (e.g., 1.5M) | Total items in system | Every 5 minutes |
| Status | System or feature status | On change |

## Navigation Flow

### Primary User Journeys

#### Operations Manager Flow
1. Dashboard > Operations → View KPIs
2. Transactions > Live Monitor → Monitor real-time
3. Transactions > Exception Queue → Handle exceptions
4. Reports > Export Center → Generate reports

#### Settlement Admin Flow
1. Dashboard > Overview → Check daily metrics
2. Settlements > Process Queue → Process pending
3. Settlements > Reconciliation → Reconcile accounts
4. Settlements > Disputes → Resolve issues

#### Configuration Manager Flow
1. Clients > Onboard Client → Add new client
2. Configuration > Fee Structure → Set fees
3. Configuration > Gateway Routing → Configure routing
4. Configuration > Testing Sandbox → Test changes

#### Compliance Officer Flow
1. Compliance > Dashboard → Review status
2. Compliance > Audit Trail → Check logs
3. Compliance > Reports → Generate regulatory reports
4. Compliance > Regulatory Calendar → Track deadlines

## Technical Implementation

### Route Structure
```typescript
interface RouteConfig {
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
```

### Module Registration
All modules are registered in `/config/routes.tsx` and rendered through the ProLayout component in `/components/layouts/MainLayout.tsx`.

### Dynamic Routes
- Client Details: `/clients/:id`
- Transaction Details: `/transactions/:id`
- These routes are hidden from the menu but accessible via direct navigation

## Performance Considerations

1. **Lazy Loading**: Each module is lazy-loaded to improve initial load time
2. **Data Caching**: React Query caches module data with 5-minute TTL
3. **Real-time Updates**: WebSocket connections for LIVE badges
4. **Batch Operations**: Bulk actions available in Clients, Transactions, and Settlements

## Future Enhancements

1. **AI-Powered Insights**: Machine learning for fraud detection
2. **Mobile App**: Native mobile application for on-the-go management
3. **Advanced Analytics**: Predictive analytics for transaction patterns
4. **Blockchain Integration**: Distributed ledger for audit trails
5. **Voice Commands**: Voice-activated navigation and actions

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: SabPaisa Development Team