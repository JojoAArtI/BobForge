import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  // Projects
  projects: {
    create: (data: any) => apiClient.post('/projects', data),
    list: () => apiClient.get('/projects'),
    get: (id: string) => apiClient.get(`/projects/${id}`),
    update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`),
    statistics: (id: string) => apiClient.get(`/projects/${id}/statistics`),
  },

  // Endpoints
  endpoints: {
    parse: (projectId: string, data: any) => apiClient.post(`/projects/${projectId}/parse`, data),
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/endpoints`),
  },

  // Tools
  tools: {
    generate: (projectId: string) => apiClient.post(`/projects/${projectId}/generate-tools`),
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/tools`),
  },

  // Risk
  risk: {
    assess: (projectId: string) => apiClient.post(`/projects/${projectId}/assess-risk`),
    getPolicy: (projectId: string) => apiClient.get(`/projects/${projectId}/policy`),
  },

  // Generate
  generate: {
    code: (projectId: string) => apiClient.post(`/projects/${projectId}/generate`),
    preview: (projectId: string) => apiClient.get(`/projects/${projectId}/preview`),
  },

  // Agent
  agent: {
    query: (projectId: string, query: string, userId?: string) =>
      apiClient.post(`/projects/${projectId}/agent/query`, { query, userId }),
  },

  // Approvals
  approvals: {
    list: (projectId: string, status?: string) =>
      apiClient.get(`/projects/${projectId}/approvals`, { params: { status } }),
    approve: (approvalId: string, approvedBy: string, reason?: string) =>
      apiClient.post(`/approvals/${approvalId}/approve`, { approvedBy, reason }),
    reject: (approvalId: string, rejectedBy: string, reason?: string) =>
      apiClient.post(`/approvals/${approvalId}/reject`, { rejectedBy, reason }),
  },

  // Export
  export: {
    download: (projectId: string) => `${API_BASE_URL}/projects/${projectId}/export`,
  },
};

export default api;

// Made with Bob
