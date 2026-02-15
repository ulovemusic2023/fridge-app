/**
 * ErrorBoundary — Catches rendering errors in child components.
 * Shows a Chinese error message with retry button.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] 3D 場景載入錯誤:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontFamily: 'sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😵</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            3D 載入失敗
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', maxWidth: '300px' }}>
            您的瀏覽器可能不支援 WebGL，或發生了未預期的錯誤。
          </p>
          {this.state.error && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem', maxWidth: '400px', wordBreak: 'break-all' }}>
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            🔄 重新載入
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
