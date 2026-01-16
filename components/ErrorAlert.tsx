/**
 * ErrorAlert Component
 * Reusable alert component for displaying errors with different severity levels
 */

import React, { useState, useEffect } from 'react';
import * as Icons from './icons';
import { AppError, ValidationError } from '../lib/errors';

interface ErrorAlertProps {
    error: Error | AppError | null;
    severity?: 'error' | 'warning' | 'info' | 'success';
    dismissible?: boolean;
    autoDismiss?: number; // milliseconds
    onDismiss?: () => void;
    onRetry?: () => void;
    className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
    error,
    severity = 'error',
    dismissible = true,
    autoDismiss,
    onDismiss,
    onRetry,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(!!error);

    useEffect(() => {
        setIsVisible(!!error);

        if (error && autoDismiss && autoDismiss > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
            }, autoDismiss);

            return () => clearTimeout(timer);
        }
    }, [error, autoDismiss, onDismiss]);

    if (!isVisible || !error) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    const severityConfig = {
        error: {
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            textColor: 'text-red-400',
            icon: <Icons.XCircleIcon className="w-5 h-5" />,
        },
        warning: {
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            textColor: 'text-yellow-400',
            icon: <Icons.ExclamationTriangleIcon className="w-5 h-5" />,
        },
        info: {
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            icon: <Icons.InformationCircleIcon className="w-5 h-5" />,
        },
        success: {
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            textColor: 'text-green-400',
            icon: <Icons.CheckCircleIcon className="w-5 h-5" />,
        },
    };

    const config = severityConfig[severity];

    // Extract validation errors if present
    const validationErrors = error instanceof ValidationError ? error.errors : null;

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className} animate-fade-in-up`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <div className={config.textColor}>{config.icon}</div>

                <div className="flex-1">
                    <p className={`font-semibold ${config.textColor} mb-1`}>
                        {error instanceof AppError ? error.name : 'Error'}
                    </p>
                    <p className="text-white/80 text-sm">{error.message}</p>

                    {/* Display validation errors if present */}
                    {validationErrors && Object.keys(validationErrors).length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {Object.entries(validationErrors).map(([field, errors]) => (
                                <li key={field} className="text-sm text-white/70">
                                    <span className="font-medium">{field}:</span>{' '}
                                    {Array.isArray(errors) ? errors.join(', ') : errors}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Action buttons */}
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <Icons.ArrowPathIcon className="w-4 h-4" />
                                Încearcă din nou
                            </span>
                        </button>
                    )}
                </div>

                {dismissible && (
                    <button
                        onClick={handleDismiss}
                        className={`${config.textColor} hover:opacity-70 transition-opacity`}
                        aria-label="Dismiss alert"
                    >
                        <Icons.XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorAlert;
