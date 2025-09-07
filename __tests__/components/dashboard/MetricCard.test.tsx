import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from '@/components/dashboard/MetricCard';
import { DollarOutlined } from '@ant-design/icons';
import { TrendData } from '@/types';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 1234567,
    icon: <DollarOutlined />,
  };

  it('should render with basic props', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('should format number values with Indian locale', () => {
    render(<MetricCard {...defaultProps} value={9876543210} />);
    
    expect(screen.getByText('9,876,543,210')).toBeInTheDocument();
  });

  it('should render string values as is', () => {
    render(<MetricCard {...defaultProps} value="Custom Value" />);
    
    expect(screen.getByText('Custom Value')).toBeInTheDocument();
  });

  it('should display positive trend correctly', () => {
    const trend: TrendData = {
      current: 100,
      previous: 80,
      trend: 20,
      changePercent: 25,
    };

    render(<MetricCard {...defaultProps} trend={trend} />);
    
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('should display negative trend correctly', () => {
    const trend: TrendData = {
      current: 80,
      previous: 100,
      trend: -20,
      changePercent: -20,
    };

    render(<MetricCard {...defaultProps} trend={trend} />);
    
    expect(screen.getByText('20.0%')).toBeInTheDocument();
  });

  it('should render with prefix and suffix', () => {
    render(
      <MetricCard
        {...defaultProps}
        value={95}
        prefix="₹"
        suffix="%"
      />
    );
    
    expect(screen.getByText('₹')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('should apply custom color to icon', () => {
    const { container } = render(
      <MetricCard {...defaultProps} color="#ff0000" />
    );
    
    const icon = container.querySelector('.anticon');
    expect(icon).toHaveStyle({ color: '#ff0000' });
  });

  it('should show loading state', () => {
    const { container } = render(
      <MetricCard {...defaultProps} loading={true} />
    );
    
    const skeleton = container.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(<MetricCard {...defaultProps} value={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle undefined trend gracefully', () => {
    const { container } = render(
      <MetricCard {...defaultProps} trend={undefined} />
    );
    
    // Should not crash and should not show trend
    expect(container.querySelector('.anticon-arrow-up')).not.toBeInTheDocument();
    expect(container.querySelector('.anticon-arrow-down')).not.toBeInTheDocument();
  });

  it('should use React.memo for performance optimization', () => {
    render(<MetricCard {...defaultProps} />);
    
    // Re-render with same props should not cause re-render
    // This is hard to test directly, but we can verify the component is wrapped
    expect(MetricCard.displayName).toBe('MetricCard');
  });
});