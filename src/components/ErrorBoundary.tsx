import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('FieldNerve Uncaught Error Caught by Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold mb-2">Application Notice</h1>
            <p className="text-sm text-slate-300 mb-1">
              FieldNerve encountered an unexpected display issue.
            </p>
            <p className="text-xs text-emerald-400 font-medium mb-6">
              फील्डनर्व में एक अस्थायी त्रुटि आई। कृपया पृष्ठ को रीलोड करें।
            </p>

            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-semibold transition"
              >
                <Home className="w-4 h-4" />
                Try Again
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono overflow-auto max-h-36">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-sans mb-1 font-medium">
                  Technical Details
                </summary>
                <div className="text-red-400 font-semibold mb-1">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
