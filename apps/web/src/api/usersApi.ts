import { httpClient, mockDelay, withApiFallback } from './httpClient';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  mainGoal: string;
  allergies: string[];
  restrictions: string[];
  budgetPerWeek: number;
  availableEquipment: string[];
  physicalLimitations: string[];
  sportPreferences: string[];
};

export const mockProfile: UserProfile = {
  id: 'profile_demo_001',
  name: 'Camille Martin',
  email: 'demo@healthai.local',
  age: 34,
  heightCm: 172,
  weightKg: 74,
  mainGoal: 'Perte de graisse progressive',
  allergies: ['Noisettes'],
  restrictions: ['Peu de plats ultra-transformes', 'Diner leger'],
  budgetPerWeek: 65,
  availableEquipment: ['Tapis de sol', 'Halteres reglables', 'Elastiques'],
  physicalLimitations: ['Genou droit sensible'],
  sportPreferences: ['Marche rapide', 'Renforcement bas impact', 'Mobilite']
};

export async function getUserProfile(): Promise<UserProfile> {
  return withApiFallback(
    () => httpClient<UserProfile>('/users/me', { fallbackLabel: 'Profil indisponible' }),
    async () => {
      await mockDelay(300);
      return mockProfile;
    }
  );
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  return withApiFallback(
    () =>
      httpClient<UserProfile>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profile),
        fallbackLabel: 'Mise a jour profil indisponible'
      }),
    async () => {
      await mockDelay(350);
      return profile;
    }
  );
}
