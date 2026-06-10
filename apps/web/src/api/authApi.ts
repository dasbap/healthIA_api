import type { DemoUser, LoginCredentials, LoginResponse } from '../features/auth/authTypes';
import { httpClient, mockDelay, withApiFallback } from './httpClient';

const demoUser: DemoUser = {
  id: 'user_demo_001',
  name: 'Camille Martin',
  email: 'demo@healthai.local',
  role: 'demo-user'
};

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return withApiFallback(
    () =>
      httpClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        fallbackLabel: 'Connexion indisponible'
      }),
    async () => {
      await mockDelay(350);
      if (credentials.email !== 'demo@healthai.local' || credentials.password !== 'Demo123!') {
        throw new Error('Identifiants demo invalides. Utilisez demo@healthai.local / Demo123!');
      }

      const response = {
        user: demoUser,
        token: 'demo-token-healthai'
      };
      localStorage.setItem('healthai_user', JSON.stringify(response.user));
      localStorage.setItem('healthai_token', response.token);
      return response;
    }
  );
}

export function getCurrentUser(): DemoUser {
  const stored = localStorage.getItem('healthai_user');
  if (stored) {
    return JSON.parse(stored) as DemoUser;
  }
  return demoUser;
}

export function logout() {
  localStorage.removeItem('healthai_user');
  localStorage.removeItem('healthai_token');
}
