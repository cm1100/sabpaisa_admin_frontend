/**
 * Chart Configuration Factory
 * Implements SOLID principles for chart configurations
 * Single Responsibility: Each function handles one chart type
 * Open/Closed: Extensible for new chart types without modification
 * Interface Segregation: Specific interfaces for each chart type
 */

type EChartsOption = any;
// Use Ant Design tokens via context; avoid custom theme color imports

// Interface for chart configuration context
interface ChartContext {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width?: number;
  height?: number;
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
}

// Abstract factory interface
interface ChartConfigFactory {
  create(data: any, context: ChartContext): EChartsOption;
}

/**
 * Transaction Volume Chart Configuration
 * Single Responsibility: Only handles transaction volume chart config
 */
export class TransactionVolumeChartConfig implements ChartConfigFactory {
  create(data: { hourlyData?: any[] }, context: ChartContext): EChartsOption {
    const { isMobile, colorPrimary, colorSuccess } = context;
    const hexToRgba = (hex: string, alpha: number) => {
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      title: {
        text: isMobile ? 'Volume & Count' : 'Transaction Volume & Count',
        textStyle: {
          fontSize: isMobile ? 14 : 16,
          fontWeight: 500,
        },
        left: 'center',
        top: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        confine: true,
        position: function(point: number[], params: any, dom: any, rect: any, size: any) {
          // Responsive tooltip positioning
          const x = point[0] < size.viewSize[0] / 2 ? point[0] : point[0] - size.contentSize[0];
          const y = point[1] < size.viewSize[1] / 2 ? point[1] : point[1] - size.contentSize[1];
          return [x, y];
        }
      },
      legend: {
        data: ['Volume (₹)', 'Transactions'],
        bottom: 0,
        orient: 'horizontal',
        itemGap: isMobile ? 5 : 10,
        textStyle: {
          fontSize: isMobile ? 10 : 12,
        },
      },
      grid: {
        left: isMobile ? '12%' : '8%',
        right: isMobile ? '12%' : '8%',
        bottom: isMobile ? '22%' : '18%',
        top: isMobile ? '18%' : '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.hourlyData?.map(d => d.hour) || [],
        axisLabel: {
          rotate: isMobile ? 45 : 0,
          fontSize: isMobile ? 10 : 12,
          interval: isMobile ? 'auto' : 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: isMobile ? '₹Cr' : 'Volume (₹ Cr)',
          position: 'left',
          nameTextStyle: {
            fontSize: isMobile ? 10 : 12,
          },
          axisLabel: {
            fontSize: isMobile ? 10 : 11,
            formatter: (value: number) => `₹${(value / 10000000).toFixed(1)}`,
          },
        },
        {
          type: 'value',
          name: isMobile ? 'Txns' : 'Transactions',
          position: 'right',
          nameTextStyle: {
            fontSize: isMobile ? 10 : 12,
          },
          axisLabel: {
            fontSize: isMobile ? 10 : 11,
          },
        },
      ],
      series: [
        {
          name: 'Volume (₹)',
          type: 'bar',
          data: data.hourlyData?.map(d => d.volume) || [],
          itemStyle: {
            color: hexToRgba(colorPrimary, 0.2),
            borderColor: colorPrimary,
            borderWidth: 1,
            borderRadius: [3, 3, 0, 0],
          },
          yAxisIndex: 0,
        },
        {
          name: 'Transactions',
          type: 'line',
          data: data.hourlyData?.map(d => d.transactions) || [],
          itemStyle: { color: colorSuccess },
          yAxisIndex: 1,
          smooth: true,
        },
      ],
    };
  }
}

/**
 * Payment Methods Pie Chart Configuration
 * Single Responsibility: Only handles payment methods chart config
 */
export class PaymentMethodsChartConfig implements ChartConfigFactory {
  create(data: { paymentMethods?: any[] }, context: ChartContext): EChartsOption {
    const { isMobile, isTablet, colorPrimary, colorSuccess, colorWarning, colorInfo, colorError } = context;
    const isSmallScreen = isMobile || isTablet;
    const palette = [colorPrimary, colorSuccess, colorWarning, colorInfo, colorError];
    
    return {
      title: {
        text: isMobile ? 'Payment Methods' : 'Payment Method Distribution',
        textStyle: {
          fontSize: isMobile ? 14 : 16,
          fontWeight: 500,
        },
        left: 'center',
        top: 0,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        confine: true,
      },
      legend: {
        type: 'scroll',
        orient: isSmallScreen ? 'horizontal' : 'vertical',
        [isSmallScreen ? 'bottom' : 'right']: isSmallScreen ? 10 : 0,
        [isSmallScreen ? 'left' : 'top']: isSmallScreen ? 'center' : 'middle',
        itemGap: isMobile ? 5 : 10,
        itemWidth: isMobile ? 15 : 20,
        itemHeight: isMobile ? 10 : 14,
        textStyle: {
          fontSize: isMobile ? 10 : 12,
        },
        formatter: function(name: string) {
          // Truncate long names on mobile
          if (isMobile && name.length > 10) {
            return name.substring(0, 10) + '...';
          }
          return name;
        },
      },
      series: [
        {
          name: 'Payment Methods',
          type: 'pie',
          radius: isSmallScreen ? ['30%', '45%'] : ['35%', '65%'],
          center: isSmallScreen ? ['50%', '35%'] : ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'var(--app-colorBgElevated)',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: isMobile ? 16 : 20,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.paymentMethods?.map((method, idx) => ({
            value: method.count,
            name: method.mode,
            itemStyle: { color: palette[idx % palette.length] },
          })) || [],
        },
      ],
    };
  }
}

/**
 * Success Rate Trend Chart Configuration
 * Single Responsibility: Only handles success rate trend chart
 */
export class SuccessRateTrendConfig implements ChartConfigFactory {
  create(data: { successTrend?: any[] }, context: ChartContext): EChartsOption {
    const { isMobile, colorSuccess } = context;
    const hexToRgba = (hex: string, alpha: number) => {
      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      title: {
        text: 'Success Rate Trend',
        textStyle: {
          fontSize: isMobile ? 14 : 16,
          fontWeight: 500,
        },
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%',
        confine: true,
      },
      grid: {
        left: isMobile ? '15%' : '10%',
        right: isMobile ? '10%' : '8%',
        bottom: isMobile ? '15%' : '12%',
        top: isMobile ? '20%' : '18%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.successTrend?.map(d => d.time) || [],
        axisLabel: {
          fontSize: isMobile ? 10 : 12,
          rotate: isMobile ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        min: 90,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          fontSize: isMobile ? 10 : 12,
        },
      },
      series: [
        {
          name: 'Success Rate',
          type: 'line',
          smooth: true,
          data: data.successTrend?.map(d => d.rate) || [],
          areaStyle: { color: hexToRgba(colorSuccess, 0.2) },
          lineStyle: { color: colorSuccess, width: 2 },
          symbolSize: isMobile ? 4 : 6,
        },
      ],
    };
  }
}

/**
 * Mini Chart Configuration for StatisticCards
 * Single Responsibility: Handles small inline charts
 */
export class MiniChartConfig {
  static createLineChart(data: number[], color: string = 'var(--app-colorPrimary)'): EChartsOption {
    return {
      xAxis: { show: false, type: 'category' },
      yAxis: { show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: 'line',
        smooth: true,
        data: data,
        areaStyle: {
          color: `${color}20`, // 20% opacity
        },
        lineStyle: {
          color: color,
          width: 2,
        },
        showSymbol: false,
      }],
    };
  }

  static createBarChart(data: number[], color: string = 'var(--app-colorSuccess)'): EChartsOption {
    return {
      xAxis: { show: false, type: 'category' },
      yAxis: { show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: 'bar',
        data: data,
        itemStyle: {
          color: color,
          borderRadius: [2, 2, 0, 0],
        },
      }],
    };
  }
}

/**
 * Chart Configuration Manager
 * Dependency Inversion: Depends on abstractions (ChartConfigFactory)
 */
export class ChartConfigManager {
  private factories: Map<string, ChartConfigFactory>;

  constructor() {
    this.factories = new Map();
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.factories.set('transactionVolume', new TransactionVolumeChartConfig());
    this.factories.set('paymentMethods', new PaymentMethodsChartConfig());
    this.factories.set('successRate', new SuccessRateTrendConfig());
  }

  register(name: string, factory: ChartConfigFactory): void {
    this.factories.set(name, factory);
  }

  getConfig(name: string, data: any, context: ChartContext): EChartsOption | null {
    const factory = this.factories.get(name);
    if (!factory) {
      console.warn(`Chart config factory '${name}' not found`);
      return null;
    }
    return factory.create(data, context);
  }
}

// Export singleton instance
export const chartConfigManager = new ChartConfigManager();

// Export factory function for convenience
export function getChartConfig(
  type: string, 
  data: any, 
  context: ChartContext
): EChartsOption | null {
  return chartConfigManager.getConfig(type, data, context);
}
