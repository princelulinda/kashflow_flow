import api from '@/lib/axios';

export interface OAuthAppDetails {
  application: {
    id: number;
    name: string;
  };
  redirect_uri: string;
}

export interface OAuthApproveResponse {
  code: string;
  redirect_url: string;
}

export const oauthService = {
  /**
   * Vérifie l'application tierce et retourne ses détails
   */
  async authorize(clientId: string, redirectUri: string): Promise<OAuthAppDetails> {
    const response = await api.get('/oauth/authorize', {
      params: { client_id: clientId, redirect_uri: redirectUri },
    });
    return response.data;
  },

  /**
   * Approuve l'accès et retourne l'URL de redirection avec le code
   */
  async approve(clientId: string, redirectUri: string): Promise<OAuthApproveResponse> {
    const response = await api.post('/oauth/approve', {
      client_id: clientId,
      redirect_uri: redirectUri,
    });
    return response.data;
  },
};
