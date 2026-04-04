import api from '@/lib/axios';

export interface Application {
  id: number;
  ownerId: number;
  name: string;
  apiKey: string;
  secret: string;
  commissionPercentage: number;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppPayload {
  name: string;
  commissionPercentage: number;
  webhookUrl: string | null;
}

export interface UpdateAppPayload {
  name?: string;
  commissionPercentage?: number;
  webhookUrl?: string | null;
}

export const appService = {
  /**
   * List all applications
   */
  async list() {
    const response = await api.get<Application[]>('/applications/');
    return response.data;
  },

  /**
   * Create a new application
   */
  async create(payload: CreateAppPayload) {
    const response = await api.post<Application>('/applications/', payload);
    return response.data;
  },

  /**
   * Get application details
   */
  async getById(id: number) {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Update an existing application
   */
  async update(id: number, payload: UpdateAppPayload) {
    const response = await api.patch<Application>(`/applications/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an application
   */
  async delete(id: number) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  }
};
