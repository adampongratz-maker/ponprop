import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 border border-rose-100 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 mb-4">
              <span className="text-2xl">⚠</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 text-sm mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <p className="text-xs text-rose-600 font-mono bg-rose-50 rounded-lg p-3 text-left mb-6 break-all">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:shadow-lg transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
