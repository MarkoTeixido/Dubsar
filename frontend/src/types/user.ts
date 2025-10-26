export type User = {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  createdAt?: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type AuthState = {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};