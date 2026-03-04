import React, { ReactNode, Component, ErrorInfo } from 'react';

interface Props {
       children: ReactNode;
       fallback?: (error: Error) => ReactNode;
}

interface State {
       hasError: boolean;
       error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
       constructor(props: Props) {
              super(props);
              this.state = { hasError: false, error: null };
       }

       static getDerivedStateFromError(error: Error): State {
              return { hasError: true, error };
       }

       componentDidCatch(error: Error, errorInfo: ErrorInfo) {
              console.error('Error Boundary caught:', error, errorInfo);
       }

       render() {
              if (this.state.hasError) {
                     return (
                            this.props.fallback?.(this.state.error!) || (
                                   <div className="w-full h-full bg-neutral-900 flex items-center justify-center rounded-lg">
                                          <div className="text-center px-6">
                                                 <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                 </svg>
                                                 <p className="text-red-400 font-semibold mb-2">Error al cargar el modelo</p>
                                                 <p className="text-neutral-400 text-sm">{this.state.error?.message}</p>
                                          </div>
                                   </div>
                            )
                     );
              }

              return this.props.children;
       }
}
