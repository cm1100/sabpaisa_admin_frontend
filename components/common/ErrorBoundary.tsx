'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Collapse } from '@/components/ui';
import { CentralButton, CentralText, CentralParagraph } from '@/components/ui';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 'var(--spacing-xl)'
        }}>
          <Result
            status="error"
            icon={<BugOutlined />}
            title="Oops! Something went wrong"
            subTitle="We're sorry for the inconvenience. The application encountered an unexpected error."
            extra={[
              <CentralButton 
                type="primary" 
                key="retry"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
              >
                Try Again
              </CentralButton>,
              <CentralButton 
                key="home"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </CentralButton>
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Collapse 
                ghost 
                style={{ marginTop: 'var(--spacing-xl)', textAlign: 'left' }}
              >
                <Panel 
                  header={<CentralText type="danger">Error Details (Development Only)</CentralText>} 
                  key="1"
                >
                  <CentralParagraph>
                    <CentralText strong>Error Message:</CentralText>
                    <br />
                    <CentralText code>{this.state.error.message}</CentralText>
                  </CentralParagraph>
                  
                  {this.state.error.stack && (
                    <CentralParagraph>
                      <CentralText strong>Stack Trace:</CentralText>
                      <pre style={{ 
                        fontSize: 'var(--font-size-12)', 
                        overflow: 'auto',
                        background: 'var(--color-bg-secondary)',
                        padding: 'var(--spacing-md)',
                        borderRadius: '4px'
                      }}>
                        {this.state.error.stack}
                      </pre>
                    </CentralParagraph>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <CentralParagraph>
                      <CentralText strong>Component Stack:</CentralText>
                      <pre style={{ 
                        fontSize: 'var(--font-size-12)', 
                        overflow: 'auto',
                        background: 'var(--color-bg-secondary)',
                        padding: 'var(--spacing-md)',
                        borderRadius: '4px'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </CentralParagraph>
                  )}
                </Panel>
              </Collapse>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
