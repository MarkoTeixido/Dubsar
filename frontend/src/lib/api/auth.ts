import { ApiClient } from './client';

/**
 * AuthApi - Gestiona todos los endpoints relacionados con autenticación
 */
class AuthApi extends ApiClient {
  async register(email: string, password: string, fullName?: string) {
    return this.post('/auth/register', {
      email,
      password,
      fullName,
    }, { 'Content-Type': 'application/json' });
  }

  async login(email: string, password: string) {
    const data = await this.post('/auth/login', {
      email,
      password,
    }, { 'Content-Type': 'application/json' });

    // Guardar tokens
    if (data.session) {
      this.saveAuthTokens(
        data.session.access_token,
        data.session.refresh_token
      );
    }

    return data;
  }

  async logout() {
    try {
      return await this.post('/auth/logout', {});
    } finally {
      // Limpiar tokens siempre
      this.clearAuthTokens();
    }
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(data: { fullName?: string; avatar?: string }) {
    console.log('📤 Enviando actualización de perfil:', data);

    const updatedUser = await this.patch('/auth/profile', data);

    console.log('✅ Perfil actualizado:', updatedUser);
    return updatedUser;
  }

  async deleteAccount() {
    try {
      return await this.delete('/auth/account');
    } finally {
      // Limpiar tokens
      this.clearAuthTokens();
    }
  }

  async signInWithGoogle() {
    const isClient = typeof window !== 'undefined';
    if (!isClient) {
      throw new Error('Google OAuth solo puede ejecutarse en el cliente');
    }

    const redirectUrl = `${window.location.origin}`;

    const data = await this.get(
      `/auth/oauth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`,
      { 'Content-Type': 'application/json' }
    );

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No se pudo obtener URL de Google OAuth');
    }
  }
}

export const auth = new AuthApi();