import React, { type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../domain/observability/observabilityRepository';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  private readonly childrenNode: ReactNode;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.childrenNode = props.children;
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(JSON.stringify({ level: 'error', message: error.message, stack: error.stack, route: window.location.pathname }));
    void reportError({
      severity: 'critical',
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] px-4">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-black text-[#0B2545]">Algo fallo en CorAM</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Ya registramos el error para revision. Recarga la pagina e intenta nuevamente.</p>
          </div>
        </main>
      );
    }

    return this.childrenNode;
  }
}
