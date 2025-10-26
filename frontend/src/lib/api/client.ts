const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

/**
 * ApiClient base - Maneja headers, autenticación y fetch
 * No contiene lógica de endpoints específicos
 */
export class ApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtener headers de autenticación con Content-Type
   */
  protected getAuthHeaders(): HeadersInit {
    if (!isClient) {
      return { 'Content-Type': 'application/json' };
    }

    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Obtener solo el token (sin Content-Type)
   */
  protected getAuthToken(): string | null {
    if (!isClient) return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Hacer GET request
   */
  protected async get(endpoint: string, headers?: HeadersInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: headers || this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer POST request
   */
  protected async post(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: HeadersInit
  ) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: headers || this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer PUT request
   */
  protected async put(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: HeadersInit
  ) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: headers || this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer PATCH request
   */
  protected async patch(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: HeadersInit
  ) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: headers || this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(
          error.message || error.error || `Error ${response.status}`
        );
      } catch {
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    }

    return response.json();
  }

  /**
   * Hacer DELETE request
   */
  protected async delete(endpoint: string, headers?: HeadersInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: headers || this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Hacer POST request retornando Response (para streams)
   */
  protected async postStream(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: HeadersInit
  ): Promise<Response> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: headers || this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
  }

  /**
   * Hacer POST request con FormData (para file uploads)
   */
  protected async postFormData(
    endpoint: string,
    formData: FormData,
    additionalHeaders?: Record<string, string>
  ) {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(additionalHeaders || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `Error ${response.status}`);
    }

    return response.json();
  }

  /**
   * Limpiar tokens del localStorage
   */
  protected clearAuthTokens(): void {
    if (isClient) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Guardar tokens en localStorage
   */
  protected saveAuthTokens(accessToken: string, refreshToken: string): void {
    if (isClient) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }
}