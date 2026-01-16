/**
 * API Client - Centralized HTTP client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
}

class ApiClient {
    private baseURL: string;
    private token: string | null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('pegasus_auth_token');
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
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async get<T = any>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    async post<T = any>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async put<T = any>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('pegasus_auth_token', token);
        } else {
            localStorage.removeItem('pegasus_auth_token');
        }
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
