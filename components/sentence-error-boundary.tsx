"use client";

import React, { Component, ReactNode } from "react";

interface SentenceErrorBoundaryProps {
  sentenceId: string;
  children: ReactNode;
}

interface SentenceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SentenceErrorBoundary extends Component<
  SentenceErrorBoundaryProps,
  SentenceErrorBoundaryState
> {
  constructor(props: SentenceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SentenceErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error rendering sentence ${this.props.sentenceId}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="sentence-error-fallback"
          role="alert"
          style={{
            padding: "1rem 1.25rem",
            margin: "1rem 0",
            borderRadius: "0.375rem",
            background: "var(--error-bg, #fee2e2)",
            border: "1px solid var(--error-border, #fca5a5)",
            color: "var(--error-text, #b91c1c)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          <p style={{ fontWeight: 600, margin: "0 0 0.5rem" }}>
            Unable to render sentence segment ({this.props.sentenceId})
          </p>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.825rem" }}>
            {this.state.error?.message || "A rendering error occurred in this sentence."}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              borderRadius: "0.25rem",
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--rule)",
              cursor: "pointer",
            }}
          >
            Retry rendering
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
