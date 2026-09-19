import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/15 bg-white/75 dark:bg-[#161412]/85 backdrop-blur-2xl shadow-xl text-center space-y-4 text-stone-900 dark:text-stone-100">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-amber-500/15 border border-amber-400/30 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif italic text-xl font-semibold">
                An Unexpected Disruption
              </h3>
              <p className="text-xs font-sans text-stone-600 dark:text-stone-400 leading-relaxed">
                A rendering artifact occurred. You can safely restore the canvas below.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Canvas</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
