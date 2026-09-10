import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Sahayak ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.toString() || 'Unknown runtime error';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6 text-center">
            
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Something went wrong loading this component
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sahayak encountered an unexpected client-side rendering issue. Your sovereign credentials and active session remain secure.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again / Reload</span>
              </button>

              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Return to Home</span>
              </button>
            </div>

            {/* Collapsible Technical Diagnostics for Debugging */}
            {this.state.error && (
              <details className="text-left bg-slate-50 rounded-2xl border border-slate-200 p-3 text-xs text-slate-600 group">
                <summary className="cursor-pointer font-mono text-[11px] font-bold text-slate-700 select-none flex items-center justify-between">
                  <span>Diagnostic Error Details (Technical Log)</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 space-y-2 font-mono text-[10px] text-rose-700 bg-white p-3 rounded-xl border border-rose-100 overflow-x-auto max-h-48 overflow-y-auto">
                  <p className="font-bold">{errorMsg}</p>
                  {componentStack && (
                    <pre className="whitespace-pre-wrap text-slate-500 mt-1">
                      {componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
