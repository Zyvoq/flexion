import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Flexion ErrorBoundary] Uncaught React error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="camera-error" style={{ minHeight: '60vh' }}>
          <div className="camera-error__icon">⚠️</div>
          <h2 className="camera-error__title">Application Encountered an Error</h2>
          <p className="camera-error__message">
            {this.state.error?.message || 'An unexpected error occurred while running Flexion.'}
          </p>
          <button
            type="button"
            className="exercise-pill exercise-pill--active"
            onClick={this.handleReload}
            style={{ marginTop: '1rem' }}
          >
            🔄 Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
