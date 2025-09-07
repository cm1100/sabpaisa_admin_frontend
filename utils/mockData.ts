/**
 * Mock data for development
 * Simulates real payment gateway data
 */
import { IClient, ClientStatus, ClientType, KYCStatus } from '@/interfaces/models/IClient';
import { ITransaction, TransactionStatus, PaymentMethod, TransactionType } from '@/interfaces/models/ITransaction';

// Generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate mock clients
export const generateMockClients = (count: number = 100): IClient[] => {
  const clients: IClient[] = [];
  const businessNames = ['Tech Solutions', 'Global Traders', 'Digital Services', 'E-Commerce Hub', 'Payment Pro'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata'];
  
  for (let i = 1; i <= count; i++) {
    const businessName = `${businessNames[Math.floor(Math.random() * businessNames.length)]} ${i}`;
    clients.push({
      id: `client-${i}`,
      clientCode: `CL${String(i).padStart(5, '0')}`,
      clientName: businessName,
      legalName: `${businessName} Pvt Ltd`,
      clientType: Object.values(ClientType)[Math.floor(Math.random() * Object.values(ClientType).length)],
      email: `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      address: {
        line1: `${Math.floor(Math.random() * 999)} Business Park`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: 'Maharashtra',
        country: 'India',
        pincode: `${Math.floor(400000 + Math.random() * 99999)}`,
      },
      businessCategory: ['Retail', 'Services', 'Manufacturing', 'Technology'][Math.floor(Math.random() * 4)],
      industryType: ['E-commerce', 'SaaS', 'FinTech', 'EdTech', 'HealthTech'][Math.floor(Math.random() * 5)],
      annualTurnover: Math.floor(Math.random() * 100000000),
      employeeCount: Math.floor(10 + Math.random() * 990),
      kycStatus: Object.values(KYCStatus)[Math.floor(Math.random() * Object.values(KYCStatus).length)],
      kycVerifiedDate: randomDate(new Date(2023, 0, 1), new Date()),
      bankAccounts: [{
        id: `bank-${i}`,
        accountNumber: `${Math.floor(100000000000 + Math.random() * 899999999999)}`,
        accountHolderName: businessName,
        bankName: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'][Math.floor(Math.random() * 4)],
        branchName: 'Main Branch',
        ifscCode: `${['HDFC', 'ICIC', 'SBIN', 'UTIB'][Math.floor(Math.random() * 4)]}0${Math.floor(100000 + Math.random() * 899999)}`,
        accountType: 'CURRENT',
        isPrimary: true,
        isVerified: true,
        verifiedDate: randomDate(new Date(2023, 0, 1), new Date()),
      }],
      configuration: {
        enabledPaymentMethods: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'],
        dailyTransactionLimit: 10000000,
        monthlyTransactionLimit: 300000000,
        perTransactionLimit: 500000,
        minTransactionAmount: 10,
        settlementFrequency: 'DAILY',
        autoSettlement: true,
        feeStructureId: `fee-${i}`,
        requireMFA: true,
        enabledFeatures: ['instant-settlement', 'bulk-upload', 'api-access'],
      },
      status: Object.values(ClientStatus)[Math.floor(Math.random() * Object.values(ClientStatus).length)],
      totalTransactions: Math.floor(Math.random() * 100000),
      totalVolume: Math.floor(Math.random() * 1000000000),
      lastTransactionDate: randomDate(new Date(2024, 0, 1), new Date()),
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 6, 1)),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin',
      isDeleted: false,
    } as IClient);
  }
  
  return clients;
};

// Generate mock transactions
export const generateMockTransactions = (count: number = 1000): ITransaction[] => {
  const transactions: ITransaction[] = [];
  const merchants = ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Uber', 'Ola', 'BookMyShow'];
  
  for (let i = 1; i <= count; i++) {
    const amount = Math.floor(100 + Math.random() * 99900);
    const platformFee = amount * 0.02;
    const gatewayFee = amount * 0.01;
    const taxAmount = (platformFee + gatewayFee) * 0.18;
    
    transactions.push({
      id: `txn-${i}`,
      transactionId: `TXN${Date.now()}${i}`,
      referenceId: `REF${String(i).padStart(8, '0')}`,
      orderId: `ORD${String(i).padStart(8, '0')}`,
      clientId: `client-${Math.floor(1 + Math.random() * 100)}`,
      clientCode: `CL${String(Math.floor(1 + Math.random() * 100)).padStart(5, '0')}`,
      clientName: merchants[Math.floor(Math.random() * merchants.length)],
      customerName: `Customer ${i}`,
      customerEmail: `customer${i}@example.com`,
      customerPhone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`,
      transactionType: TransactionType.PAYMENT,
      paymentMethod: Object.values(PaymentMethod)[Math.floor(Math.random() * Object.values(PaymentMethod).length)],
      amount,
      currency: 'INR',
      platformFee,
      gatewayFee,
      taxAmount,
      netAmount: amount - platformFee - gatewayFee - taxAmount,
      settlementAmount: amount - platformFee - gatewayFee - taxAmount,
      status: Object.values(TransactionStatus)[Math.floor(Math.random() * Object.values(TransactionStatus).length)],
      statusHistory: [{
        status: TransactionStatus.INITIATED,
        timestamp: randomDate(new Date(Date.now() - 86400000), new Date()),
      }],
      gatewayId: 'razorpay',
      gatewayTransactionId: `pay_${Math.random().toString(36).substr(2, 14)}`,
      isSettled: Math.random() > 0.3,
      isRefundable: Math.random() > 0.5,
      initiatedAt: randomDate(new Date(Date.now() - 86400000 * 30), new Date()),
      completedAt: randomDate(new Date(Date.now() - 86400000 * 30), new Date()),
      createdAt: randomDate(new Date(Date.now() - 86400000 * 30), new Date()),
      updatedAt: new Date(),
    } as ITransaction);
  }
  
  return transactions;
};

// Dashboard metrics
export const generateDashboardMetrics = () => {
  const now = new Date();
  const todayTransactions = Math.floor(10000 + Math.random() * 5000);
  const todayVolume = Math.floor(80000000 + Math.random() * 20000000);
  
  return {
    overview: {
      todayTransactions,
      todayVolume,
      successRate: 97.5 + Math.random() * 2,
      activeClients: Math.floor(14000 + Math.random() * 2000),
      pendingSettlements: Math.floor(20 + Math.random() * 30),
      avgResponseTime: 150 + Math.random() * 100,
    },
    trends: {
      transactions: {
        current: todayTransactions,
        previous: Math.floor(9000 + Math.random() * 4000),
        trend: ((todayTransactions - 9500) / 9500) * 100,
      },
      volume: {
        current: todayVolume,
        previous: Math.floor(75000000 + Math.random() * 20000000),
        trend: ((todayVolume - 77500000) / 77500000) * 100,
      },
      successRate: {
        current: 97.5 + Math.random() * 2,
        previous: 96.8 + Math.random() * 2,
        trend: 0.7,
      },
    },
    hourlyData: Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      transactions: Math.floor(200 + Math.random() * 800),
      volume: Math.floor(2000000 + Math.random() * 5000000),
      successRate: 95 + Math.random() * 5,
    })),
    paymentMethods: [
      { method: 'UPI', count: 4500, volume: 25000000, percentage: 45 },
      { method: 'Credit Card', count: 2000, volume: 30000000, percentage: 20 },
      { method: 'Debit Card', count: 1500, volume: 15000000, percentage: 15 },
      { method: 'Net Banking', count: 1000, volume: 20000000, percentage: 10 },
      { method: 'Wallet', count: 800, volume: 8000000, percentage: 8 },
      { method: 'Others', count: 200, volume: 2000000, percentage: 2 },
    ],
    topClients: Array.from({ length: 5 }, (_, i) => ({
      id: `client-${i + 1}`,
      name: ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Uber'][i],
      transactions: Math.floor(500 + Math.random() * 1500),
      volume: Math.floor(5000000 + Math.random() * 15000000),
      growth: -10 + Math.random() * 30,
    })),
    recentAlerts: [
      {
        id: '1',
        type: 'warning',
        message: 'High transaction failure rate detected for UPI payments',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: '2',
        type: 'info',
        message: 'Scheduled maintenance on Dec 15, 2024 from 2:00 AM to 4:00 AM',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '3',
        type: 'success',
        message: 'Settlement batch processed successfully for 1,234 merchants',
        timestamp: new Date(Date.now() - 7200000),
      },
    ],
  };
};

// Settlement data
export const generateSettlementData = () => {
  return {
    pending: Array.from({ length: 20 }, (_, i) => ({
      id: `settlement-${i + 1}`,
      clientId: `client-${i + 1}`,
      clientName: `Merchant ${i + 1}`,
      amount: Math.floor(50000 + Math.random() * 450000),
      transactionCount: Math.floor(10 + Math.random() * 90),
      dueDate: new Date(Date.now() + 86400000 * (i % 3)),
      status: 'PENDING',
      bankAccount: `****${Math.floor(1000 + Math.random() * 8999)}`,
    })),
    processed: Array.from({ length: 50 }, (_, i) => ({
      id: `settlement-${i + 21}`,
      clientId: `client-${i + 1}`,
      clientName: `Merchant ${i + 1}`,
      amount: Math.floor(50000 + Math.random() * 450000),
      transactionCount: Math.floor(10 + Math.random() * 90),
      processedDate: randomDate(new Date(Date.now() - 86400000 * 7), new Date()),
      status: 'COMPLETED',
      bankAccount: `****${Math.floor(1000 + Math.random() * 8999)}`,
      utr: `UTR${Date.now()}${i}`,
    })),
  };
};

// Generate time series data for charts
export const generateTimeSeriesData = (points: number = 30) => {
  const data = [];
  const baseValue = 1000000;
  const now = Date.now();
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now - (points - i) * 86400000);
    const value = baseValue + Math.random() * 500000 - 250000;
    const transactions = Math.floor(8000 + Math.random() * 4000);
    
    data.push({
      date: timestamp.toISOString().split('T')[0],
      timestamp,
      volume: Math.floor(value),
      transactions,
      successRate: 95 + Math.random() * 5,
      avgTicketSize: Math.floor(value / transactions),
    });
  }
  
  return data;
};