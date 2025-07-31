import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4">
          <div className="text-center">
            <h2 className="text-danger mb-3">⚠️ Something went wrong</h2>
            <p className="text-muted mb-4">
              This page encountered an error. Please try refreshing or contact support.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Page
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.history.back()}
              >
                ← Go Back
              </button>
            </div>
            {import.meta.env.DEV && (
              <details className="mt-4 text-start">
                <summary className="btn btn-link">Show Error Details</summary>
                <pre className="bg-light p-3 mt-2 text-start" style={{ fontSize: '12px' }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
