import api from '@/lib/axios';

export interface Wallet {
  id: number;
  userId: number;
  type: 'dev' | 'vendor';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountStats {
  total_balance: number;
  today: { sales_amount: number; transaction_count: number };
  wallets_count: number;
}

export const accountService = {
  /**
   * Overall stats: total balance and today's sales through the user's applications
   */
  async getStats() {
    const response = await api.get<AccountStats>('/account/stats');
    return response.data;
  },

  /**
   * Get all user wallets (dev and vendor)
   */
  async getWallets() {
    const response = await api.get<Wallet[]>('/account/wallets');
    return response.data;
  }
};
