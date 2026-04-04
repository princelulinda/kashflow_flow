import api from '@/lib/axios';

export interface Wallet {
  id: number;
  userId: number;
  type: 'dev' | 'vendor';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export const accountService = {
  /**
   * Get all user wallets (dev and vendor)
   */
  async getWallets() {
    const response = await api.get<Wallet[]>('/account/wallets');
    return response.data;
  }
};
