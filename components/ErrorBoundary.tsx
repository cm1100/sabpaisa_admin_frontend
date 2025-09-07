"use client";
import React from 'react';
import { notifyError } from '@/utils/notify';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    // Surface a toast for unexpected render errors
    notifyError(error, 'An unexpected error occurred');
  }

  render() {
    // Render children regardless; the toast informs the user
    return this.props.children as React.ReactElement;
  }
}

