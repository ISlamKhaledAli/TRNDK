import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            The application encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Go to Home
            </button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-muted rounded-lg text-left max-w-2xl overflow-auto">
              <p className="text-xs font-mono text-destructive mb-2">{this.state.error?.toString()}</p>
              <pre className="text-[10px] font-mono whitespace-pre-wrap leading-tight text-muted-foreground">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
