import { apiClient } from '@/lib/api-client';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '@/types/auth';

export const authApi = {
  register(input: RegisterInput) {
    return apiClient.post<{ user: User }>('/api/auth/register', input);
  },

  login(input: LoginInput) {
    return apiClient.post<{ user: User }>('/api/auth/login', input);
  },

  getMe() {
    return apiClient.get<{ user: User }>('/api/auth/me');
  },

  logout() {
    return apiClient.post<{ success: boolean }>('/api/auth/logout');
  },
};
