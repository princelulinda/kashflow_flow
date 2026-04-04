import api from '@/lib/axios';

export interface Currency {
  currency_id: string;
  currency_slug: string;
  currency_name: string;
  currency_status: string;
}

export interface CurrenciesResponse {
  status: string;
  list: Currency[];
}

export interface PaymentMethod {
  payment_method_name: string;
  payment_method_type: string;
  icon: string;
  enable_on_collection: string;
  enable_on_withdrawal: string | number;
  min_amount: string;
  max_amount: string;
  collection_fee: number;
  withdrawal_fee: number;
  otp_on_collection: string | null;
  otp_on_withdrawal: string | null;
  redirection_url_on_collection: number;
  redirection_url_on_withdrawal: number;
  steps_to_follow: string;
  pending_funds: string;
  period: string;
}

export interface PaymentMethodsResponse {
  status: string;
  list: PaymentMethod[];
}

export interface WithdrawPayload {
  amount: number;
  currency: string;
  payment_method: string;
  recipient: string;
  wallet_id: number;
  comment?: string;
}

export const paymentService = {
  /**
   * List all supported currencies
   */
  async getCurrencies() {
    const response = await api.get<CurrenciesResponse>('/currencies');
    return response.data.list;
  },

  /**
   * List payment methods for a specific currency
   */
  async getPaymentMethods(currency: string, withdrawalOnly: boolean = false) {
    const params: any = { currency };
    if (withdrawalOnly) {
      params.withdrawal_only = true;
    }
    const response = await api.get<PaymentMethodsResponse>('/payment-methods', { params });
    return response.data.list;
  },

  /**
   * Initiate a withdrawal
   */
  async withdraw(payload: WithdrawPayload) {
    const response = await api.post('/account/withdraw', payload);
    return response.data;
  }
};
