import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          data-testid="error-boundary-fallback"
          role="alert"
          className="w-full max-w-lg mx-auto my-8 p-6 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4"
        >
          <div className="w-12 h-12 mx-auto bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 className="text-base font-bold text-slate-900">Something went wrong</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred while loading this view. You can try refreshing or returning to safety.
          </p>
          {this.state.error && (
            <p className="text-[11px] font-mono text-rose-600 bg-rose-50 p-2 rounded-lg max-h-24 overflow-y-auto">
              {this.state.error.message}
            </p>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              data-testid="error-boundary-retry-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
