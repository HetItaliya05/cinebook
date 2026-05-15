import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary mb-2">SOMETHING WENT WRONG</h1>
            <p className="text-text-muted text-sm mb-2">An unexpected error occurred.</p>
            <p className="text-text-muted text-xs mb-6 font-mono bg-bg-card border border-border rounded-lg p-3 text-left break-all">{this.state.error}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: '' }); window.location.href = '/'; }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
