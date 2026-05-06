import { Component } from 'react';
import { Bug, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — catches any unhandled render-time JS errors
 * and replaces the crashed subtree with a friendly fallback UI
 * instead of a blank white screen.
 *
 * Wrap the root of your app (or any risky subtree):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a service like Sentry
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate home so the user gets a clean slate
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9edf5] relative overflow-hidden">
        {/* Background blobs — match the rest of the app */}
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] top-[-200px] left-[-200px] opacity-25 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] bottom-[-200px] right-[-200px] opacity-25 pointer-events-none" />

        <div className="relative bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-12 max-w-md w-full mx-4 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
            <Bug className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">
            An unexpected error occurred. The details have been logged.
          </p>

          {/* Show the error message in dev */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {this.state.error.toString()}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 mx-auto px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-200 hover:scale-[1.03] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Return to Home
          </button>
        </div>
      </div>
    );
  }
}
