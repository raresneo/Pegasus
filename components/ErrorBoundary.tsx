import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Icons from './icons';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary component to catch rendering errors in its child component tree.
 */
// FIX: Extending Component directly from the react import helps TypeScript correctly resolve inherited properties like this.props and this.state.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Explicitly defining the initial state using a public class property, which is correctly typed via the generic parameters of the base Component class.
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    // FIX: Destructuring hasError from this.state and fallback, children from this.props; these are now properly recognized by the TypeScript compiler due to explicit extension of React.Component.
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      return fallback || (
        <div className="p-12 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-center backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20">
            <Icons.ShieldExclamationIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-red-500">Eroare de Segment</h3>
          <p className="text-xs text-red-500/60 uppercase tracking-widest mt-2 font-bold">Acest modul a întâmpinat o eroare critică. Vă rugăm să reîmprospătați hub-ul.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            Reinițializează Sistemul
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;