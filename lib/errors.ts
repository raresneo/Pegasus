/**
 * Error Handling System
 * Custom error classes for type-safe error handling across the application
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(message: string, errors: Record<string, string[]> = {}) {
        super(message, 400);
        this.errors = errors;
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'You do not have permission to perform this action') {
        super(message, 403);
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    public readonly conflictDetails?: any;

    constructor(message: string, conflictDetails?: any) {
        super(message, 409);
        this.conflictDetails = conflictDetails;
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class RateLimitError extends AppError {
    public readonly retryAfter: number;

    constructor(retryAfter: number = 60) {
        super('Too many requests, please try again later', 429);
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network request failed') {
        super(message, 0, false);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

/**
 * Error formatter for consistent error responses
 */
export const formatErrorResponse = (error: Error | AppError) => {
    if (error instanceof AppError) {
        return {
            success: false,
            error: {
                name: error.name,
                message: error.message,
                statusCode: error.statusCode,
                ...(error instanceof ValidationError && { errors: error.errors }),
                ...(error instanceof ConflictError && { conflictDetails: error.conflictDetails }),
                ...(error instanceof RateLimitError && { retryAfter: error.retryAfter }),
            }
        };
    }

    // Generic error fallback
    return {
        success: false,
        error: {
            name: 'Error',
            message: error.message || 'An unexpected error occurred',
            statusCode: 500,
        }
    };
};

/**
 * Check if error is operational (expected) vs programming error
 */
export const isOperationalError = (error: Error): boolean => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};
