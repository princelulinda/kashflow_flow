import api from '@/lib/axios';

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: number;
  applicationId: number | null;
  walletId: number;
  totalAmount: number;
  appCommissionAmount: number;
  vendorNetAmount: number;
  platformFee: number;
  status: TransactionStatus;
  type: TransactionType;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  application_id?: number;
}

export const transactionService = {
  /**
   * List all transactions with optional filters
   */
  async list(filters?: TransactionFilters) {
    const response = await api.get<Transaction[]>('/transactions', { params: filters });
    return response.data;
  },

  /**
   * Get transaction details by ID
   */
  async getById(id: number) {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  }
};
