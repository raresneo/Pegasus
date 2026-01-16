/**
 * API Client - Centralized HTTP client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 */

/**
 * API Client - Centralized HTTP client for backend communication
 * Enhanced with retry logic, timeout handling, and proper error management
 */

import {
    AppError,
    ValidationError,
    AuthenticationError,
    NotFoundError,
    NetworkError,
    RateLimitError
} from './errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
}

interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableStatuses: [408, 429, 500, 502, 503, 504], // Retry on these HTTP status codes
};

interface RequestConfig {
    timeout?: number;
    retries?: number;
    signal?: AbortSignal;
}

class ApiClient {
    private baseURL: string;
    private token: string | null;
    private retryConfig: RetryConfig;
    private defaultTimeout: number = 30000; // 30 seconds

    constructor(baseURL: string, retryConfig: Partial<RetryConfig> = {}) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('pegasus_auth_token');
        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        // Handle specific HTTP status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: 'Network error',
                statusCode: response.status
            }));

            switch (response.status) {
                case 400:
                    throw new ValidationError(
                        errorData.message || 'Validation failed',
                        errorData.errors || {}
                    );
                case 401:
                    throw new AuthenticationError(errorData.message);
                case 403:
                    throw new AppError(errorData.message || 'Forbidden', 403);
                case 404:
                    throw new NotFoundError(errorData.message);
                case 409:
                    throw new AppError(errorData.message || 'Conflict', 409);
                case 429:
                    throw new RateLimitError(errorData.retryAfter || 60);
                default:
                    throw new AppError(
                        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                        response.status
                    );
            }
        }

        const data = await response.json();
        return data;
    }

    /**
     * Retry logic with exponential backoff
     */
    private async retryRequest<T>(
        requestFn: () => Promise<T>,
        retries: number = this.retryConfig.maxRetries
    ): Promise<T> {
        try {
            return await requestFn();
        } catch (error) {
            // Don't retry on client errors or auth errors
            if (
                error instanceof ValidationError ||
                error instanceof AuthenticationError ||
                retries <= 0
            ) {
                throw error;
            }

            // Check if error status is retryable
            if (error instanceof AppError) {
                if (!this.retryConfig.retryableStatuses.includes(error.statusCode)) {
                    throw error;
                }
            }

            // Wait with exponential backoff
            const delay = this.retryConfig.retryDelay * Math.pow(2, this.retryConfig.maxRetries - retries);
            console.warn(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retryRequest(requestFn, retries - 1);
        }
    }

    /**
     * Create an AbortController with timeout
     */
    private createTimeoutController(timeout: number = this.defaultTimeout): AbortController {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller;
    }

    async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const controller = this.createTimeoutController(config.timeout);

        const requestFn = async () => {
            try {
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    method: 'GET',
                    headers: this.getHeaders(),
                    signal: config.signal || controller.signal,
                });

                return this.handleResponse<T>(response);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    throw new NetworkError('Request timeout');
                }
                if (error instanceof AppError) {
                    throw error;
                }
                throw new NetworkError(error.message || 'Network request failed');
            }
        };

        return this.retryRequest(requestFn, config.retries);
    }

    async post<T = any>(endpoint: string, data: any, config: RequestConfig = {}): Promise<T> {
        const controller = this.createTimeoutController(config.timeout);

        const requestFn = async () => {
            try {
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(data),
                    signal: config.signal || controller.signal,
                });

                return this.handleResponse<T>(response);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    throw new NetworkError('Request timeout');
                }
                if (error instanceof AppError) {
                    throw error;
                }
                throw new NetworkError(error.message || 'Network request failed');
            }
        };

        return this.retryRequest(requestFn, config.retries);
    }

    async put<T = any>(endpoint: string, data: any, config: RequestConfig = {}): Promise<T> {
        const controller = this.createTimeoutController(config.timeout);

        const requestFn = async () => {
            try {
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify(data),
                    signal: config.signal || controller.signal,
                });

                return this.handleResponse<T>(response);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    throw new NetworkError('Request timeout');
                }
                if (error instanceof AppError) {
                    throw error;
                }
                throw new NetworkError(error.message || 'Network request failed');
            }
        };

        return this.retryRequest(requestFn, config.retries);
    }

    async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const controller = this.createTimeoutController(config.timeout);

        const requestFn = async () => {
            try {
                const response = await fetch(`${this.baseURL}${endpoint}`, {
                    method: 'DELETE',
                    headers: this.getHeaders(),
                    signal: config.signal || controller.signal,
                });

                return this.handleResponse<T>(response);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    throw new NetworkError('Request timeout');
                }
                if (error instanceof AppError) {
                    throw error;
                }
                throw new NetworkError(error.message || 'Network request failed');
            }
        };

        return this.retryRequest(requestFn, config.retries);
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('pegasus_auth_token', token);
        } else {
            localStorage.removeItem('pegasus_auth_token');
        }
    }

    setRetryConfig(config: Partial<RetryConfig>) {
        this.retryConfig = { ...this.retryConfig, ...config };
    }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Service Methods - organized by entity

export const authAPI = {
    login: (email: string, password: string) =>
        apiClient.post<{ token: string; user: any }>('/login', { email, password }),

    register: (name: string, email: string, password: string) =>
        apiClient.post<{ token: string; user: any }>('/register', { name, email, password }),

    me: () => apiClient.get<any>('/me'),
};

export const membersAPI = {
    getAll: () => apiClient.get<any[]>('/members'),
    getById: (id: string) => apiClient.get<any>(`/members/${id}`),
    create: (data: any) => apiClient.post<any>('/members', data),
    update: (id: string, data: any) => apiClient.put<any>(`/members/${id}`, data),
    delete: (id: string) => apiClient.delete(`/members/${id}`),
    bulkDelete: (ids: string[]) => apiClient.post('/members/bulk-delete', { ids }),
    bulkUpdateStatus: (ids: string[], status: string) =>
        apiClient.post('/members/bulk-status', { ids, status }),
    addTags: (ids: string[], tags: string[]) =>
        apiClient.post('/members/bulk-tags', { ids, tags }),
};

export const bookingsAPI = {
    getAll: () => apiClient.get<any[]>('/bookings'),
    getById: (id: string) => apiClient.get<any>(`/bookings/${id}`),
    create: (data: any) => apiClient.post<any>('/bookings', data),
    update: (id: string, data: any) => apiClient.put<any>(`/bookings/${id}`, data),
    delete: (id: string) => apiClient.delete(`/bookings/${id}`),
    checkConflict: (data: any) => apiClient.post<{ conflict: boolean }>('/bookings/check-conflict', data),
};

export const paymentsAPI = {
    getAll: () => apiClient.get<any[]>('/payments'),
    getByMember: (memberId: string) => apiClient.get<any[]>(`/payments/member/${memberId}`),
    create: (data: any) => apiClient.post<any>('/payments', data),
    refund: (id: string) => apiClient.post<any>(`/payments/${id}/refund`, {}),
};

export const tasksAPI = {
    getAll: () => apiClient.get<any[]>('/tasks'),
    getById: (id: string) => apiClient.get<any>(`/tasks/${id}`),
    create: (data: any) => apiClient.post<any>('/tasks', data),
    update: (id: string, data: any) => apiClient.put<any>(`/tasks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tasks/${id}`),
    archive: (id: string, isArchived: boolean) => apiClient.put(`/tasks/${id}/archive`, { isArchived }),
};

export const productsAPI = {
    getAll: () => apiClient.get<any[]>('/products'),
    getById: (id: string) => apiClient.get<any>(`/products/${id}`),
    create: (data: any) => apiClient.post<any>('/products', data),
    update: (id: string, data: any) => apiClient.put<any>(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
    bulkUpdate: (updates: any[]) => apiClient.post('/products/bulk-update', { updates }),
};

export const prospectsAPI = {
    getAll: () => apiClient.get<any[]>('/prospects'),
    getById: (id: string) => apiClient.get<any>(`/prospects/${id}`),
    create: (data: any) => apiClient.post<any>('/prospects', data),
    update: (id: string, data: any) => apiClient.put<any>(`/prospects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/prospects/${id}`),
    bulkDelete: (ids: string[]) => apiClient.post('/prospects/bulk-delete', { ids }),
    addTags: (ids: string[], tags: string[]) =>
        apiClient.post('/prospects/bulk-tags', { ids, tags }),
};

export const assetsAPI = {
    getAll: () => apiClient.get<any[]>('/assets'),
    getById: (id: string) => apiClient.get<any>(`/assets/${id}`),
    create: (data: any) => apiClient.post<any>('/assets', data),
    update: (id: string, data: any) => apiClient.put<any>(`/assets/${id}`, data),
    delete: (id: string) => apiClient.delete(`/assets/${id}`),
    maintenance: (id: string, data: any) =>
        apiClient.post<any>(`/assets/${id}/maintenance`, data),
};

export const reportsAPI = {
    revenue: (params: any) => apiClient.get<any>('/reports/revenue?' + new URLSearchParams(params)),
    members: (params: any) => apiClient.get<any>('/reports/members?' + new URLSearchParams(params)),
    bookings: (params: any) => apiClient.get<any>('/reports/bookings?' + new URLSearchParams(params)),
    overview: () => apiClient.get<any>('/reports/overview'),
};

export default apiClient;
