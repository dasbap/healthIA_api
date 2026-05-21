import { httpClient, mockDelay, withApiFallback } from './httpClient';

export type DetectedFood = {
  label: string;
  confidence: number;
};

export type NutritionMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealAnalysisRequest = {
  imageUrl?: string;
  fileName?: string;
};

export type MealAnalysisResponse = {
  analysisId: string;
  detectedFoods: DetectedFood[];
  nutrition: NutritionMacros;
  imbalances: string[];
  suggestions: string[];
  model: string;
  createdAt: string;
};

export type NutritionRecommendationRequest = {
  goal: string;
  targetCalories: number;
  budget: number;
  allergies: string;
  diet: string;
  preferences: string;
};

export type NutritionRecommendation = {
  recommendationId: string;
  type: 'nutrition';
  title: string;
  score: number;
  mealPlan: string[];
  macros: NutritionMacros;
  constraintsChecked: {
    allergies: boolean;
    diet: boolean;
    budget: boolean;
  };
  explanation: string;
  advice: string[];
  model: string;
};

export type SportRecommendationRequest = {
  goal: string;
  level: string;
  duration: number;
  equipment: string;
  preferences: string;
  limitations: string;
  fatigue: string;
};

export type Exercise = {
  name: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  note: string;
};

export type SportRecommendation = {
  recommendationId: string;
  type: 'sport';
  title: string;
  score: number;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  exercises: Exercise[];
  explanation: string;
  warning?: string;
  model: string;
};

export async function analyzeMeal(request: MealAnalysisRequest): Promise<MealAnalysisResponse> {
  return withApiFallback(
    () =>
      httpClient<MealAnalysisResponse>('/ai/meal-analysis', {
        method: 'POST',
        body: JSON.stringify(request),
        fallbackLabel: 'Analyse repas indisponible'
      }),
    async () => {
      await mockDelay(900);
      return {
        analysisId: 'analysis_001',
        detectedFoods: [
          { label: 'Riz complet', confidence: 0.88 },
          { label: 'Poulet grille', confidence: 0.76 },
          { label: 'Legumes verts', confidence: 0.69 },
          { label: 'Sauce yaourt', confidence: 0.62 }
        ],
        nutrition: {
          calories: 620,
          protein: 42,
          carbs: 78,
          fat: 14
        },
        imbalances: ['Glucides eleves', 'Apport en proteines correct', 'Fibres legerement basses'],
        suggestions: [
          'Ajouter une portion de legumes verts supplementaire',
          'Reduire legerement la portion de riz',
          'Conserver la source de proteines maigres'
        ],
        model: 'healthai-vision-demo',
        createdAt: new Date().toISOString()
      };
    }
  );
}

export async function generateNutritionRecommendation(
  request: NutritionRecommendationRequest
): Promise<NutritionRecommendation> {
  return withApiFallback(
    () =>
      httpClient<NutritionRecommendation>('/ai/recommendations/nutrition', {
        method: 'POST',
        body: JSON.stringify(request),
        fallbackLabel: 'Recommandation nutrition indisponible'
      }),
    async () => {
      await mockDelay(750);
      return {
        recommendationId: 'rec_001',
        type: 'nutrition',
        title: 'Repas equilibre pour perte de poids',
        score: 0.87,
        mealPlan: ['Poulet grille', 'Riz complet', 'Legumes verts', 'Yaourt nature', 'Fruit frais'],
        macros: {
          calories: request.targetCalories || 540,
          protein: 43,
          carbs: 58,
          fat: 16
        },
        constraintsChecked: {
          allergies: true,
          diet: true,
          budget: request.budget >= 35
        },
        explanation:
          'Ce plan respecte l’objectif calorique, augmente l’apport en proteines et garde une densite nutritionnelle elevee avec un budget maitrise.',
        advice: [
          'Preparer les feculents en avance pour stabiliser les portions',
          'Ajouter des crudites si la faim persiste',
          'Boire un verre d’eau avant le repas pour mieux evaluer la satiete'
        ],
        model: 'healthai-nutrition-demo-v0.3'
      };
    }
  );
}

export async function generateSportRecommendation(
  request: SportRecommendationRequest
): Promise<SportRecommendation> {
  return withApiFallback(
    () =>
      httpClient<SportRecommendation>('/ai/recommendations/sport', {
        method: 'POST',
        body: JSON.stringify(request),
        fallbackLabel: 'Recommandation sportive indisponible'
      }),
    async () => {
      await mockDelay(750);
      const hasLimitation = request.limitations.trim().length > 0;
      return {
        recommendationId: 'rec_002',
        type: 'sport',
        title: 'Programme cardio debutant sans materiel',
        score: 0.84,
        duration: request.duration || 30,
        intensity: request.fatigue === 'elevee' ? 'low' : 'medium',
        exercises: [
          { name: 'Marche rapide', duration: 15, intensity: 'low', note: 'Rythme respiratoire confortable' },
          { name: 'Gainage adapte', duration: 5, intensity: 'medium', note: 'Series courtes, dos neutre' },
          { name: 'Squat adapte', duration: 8, intensity: 'medium', note: 'Amplitude reduite si douleur' },
          { name: 'Retour au calme', duration: 2, intensity: 'low', note: 'Respiration lente et mobilite' }
        ],
        explanation:
          'Programme adapte a un objectif de perte de graisse, sans materiel et avec une intensite moderee pour favoriser la regularite.',
        warning: hasLimitation
          ? 'Limitation declaree prise en compte: eviter toute douleur vive et reduire l’amplitude des mouvements.'
          : undefined,
        model: 'healthai-sport-demo-v0.2'
      };
    }
  );
}
