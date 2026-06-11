export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  activityLevel: string;
  targetCalories: number;
  diet: string;
  allergies: string[];
  dietaryRestrictions: string[];
  foodPreferences: string[];
  budgetPerWeek: number;
  sportLevel: string;
  sessionsPerWeek: number;
  durationMinutes: number;
  equipment: string[];
  physicalLimitations: string[];
  sportPreferences: string[];
};

export const defaultUserProfile: UserProfile = {
  userId: 'demo-user',
  name: 'Camille Martin',
  email: 'demo@healthai.local',
  age: 34,
  heightCm: 172,
  weightKg: 74,
  goal: 'perte de graisse',
  activityLevel: 'moderee',
  targetCalories: 560,
  diet: 'omnivore',
  allergies: ['Noisettes'],
  dietaryRestrictions: ['Peu de plats ultra-transformes', 'Diner leger'],
  foodPreferences: ['Repas rapides', 'Legumes verts', 'Poulet'],
  budgetPerWeek: 65,
  sportLevel: 'debutant',
  sessionsPerWeek: 3,
  durationMinutes: 30,
  equipment: ['Tapis de sol', 'Halteres reglables', 'Elastiques'],
  physicalLimitations: ['Genou droit sensible'],
  sportPreferences: ['Marche rapide', 'Renforcement bas impact', 'Mobilite']
};

export const profileStorageKey = 'healthai_profile';
export const profileUpdatedEventName = 'healthai-profile-updated';

type LegacyProfile = Partial<UserProfile> & {
  id?: string;
  mainGoal?: string;
  restrictions?: string[];
  availableEquipment?: string[];
};

function asList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return fallback;
}

function normalizeProfile(value: unknown): UserProfile {
  const profile = (value ?? {}) as LegacyProfile;

  return {
    ...defaultUserProfile,
    ...profile,
    userId: profile.userId || profile.id || defaultUserProfile.userId,
    goal: profile.goal || profile.mainGoal || defaultUserProfile.goal,
    activityLevel: profile.activityLevel || defaultUserProfile.activityLevel,
    targetCalories: Number(profile.targetCalories) || defaultUserProfile.targetCalories,
    diet: profile.diet || defaultUserProfile.diet,
    allergies: asList(profile.allergies, defaultUserProfile.allergies),
    dietaryRestrictions: asList(
      profile.dietaryRestrictions ?? profile.restrictions,
      defaultUserProfile.dietaryRestrictions
    ),
    foodPreferences: asList(profile.foodPreferences, defaultUserProfile.foodPreferences),
    budgetPerWeek: Number(profile.budgetPerWeek) || defaultUserProfile.budgetPerWeek,
    sportLevel: profile.sportLevel || defaultUserProfile.sportLevel,
    sessionsPerWeek: Number(profile.sessionsPerWeek) || defaultUserProfile.sessionsPerWeek,
    durationMinutes: Number(profile.durationMinutes) || defaultUserProfile.durationMinutes,
    equipment: asList(profile.equipment ?? profile.availableEquipment, defaultUserProfile.equipment),
    physicalLimitations: asList(profile.physicalLimitations, defaultUserProfile.physicalLimitations),
    sportPreferences: asList(profile.sportPreferences, defaultUserProfile.sportPreferences)
  };
}

function getStoredProfile() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(profileStorageKey);

  if (!stored) {
    return null;
  }

  try {
    return normalizeProfile(JSON.parse(stored));
  } catch {
    localStorage.removeItem(profileStorageKey);
    return null;
  }
}

export function getUserProfileSync(): UserProfile {
  return getStoredProfile() ?? defaultUserProfile;
}

export async function getUserProfile(): Promise<UserProfile> {
  return getUserProfileSync();
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  const nextProfile = normalizeProfile(profile);

  localStorage.setItem(profileStorageKey, JSON.stringify(nextProfile));
  localStorage.setItem(
    'healthai_user',
    JSON.stringify({
      id: nextProfile.userId,
      name: nextProfile.name,
      email: nextProfile.email,
      role: 'demo-user'
    })
  );
  window.dispatchEvent(new CustomEvent(profileUpdatedEventName, { detail: nextProfile }));

  return nextProfile;
}
