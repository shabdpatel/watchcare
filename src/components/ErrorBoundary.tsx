import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, info);
        // Here you can send error reports to your error tracking service
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Something went wrong</h2>
                        <p className="mt-2 text-gray-600">We apologize for the inconvenience</p>
                        <Link to="/" className="text-rose-600 hover:text-rose-500">
                            Return to home page
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
