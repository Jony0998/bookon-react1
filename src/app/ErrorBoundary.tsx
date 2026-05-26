import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p style={{ color: "#666" }}>{this.state.error?.message}</p>
          <p>Please check <strong>F12 → Console</strong> for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
