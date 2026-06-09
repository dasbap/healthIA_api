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
  file?: File;
  fileName?: string;
};

export type MealAnalysisResponse = {
  analysisId: string;
  type?: 'meal-analysis';
  title?: string;
  score?: number;
  detectedFoods: DetectedFood[];
  nutrition: NutritionMacros;
  imbalances: string[];
  suggestions: string[];
  explanation: string;
  model: string;
  createdAt: string;
  fallbackUsed: boolean;
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
  const body = request.file ? buildMealAnalysisFormData(request) : JSON.stringify({ imageUrl: request.imageUrl });

  return withApiFallback(
    () =>
      httpClient<MealAnalysisResponse>('/ai/meal/analyze', {
        method: 'POST',
        body,
        fallbackLabel: 'Analyse repas indisponible'
      }),
    async () => {
      await mockDelay(900);
      return {
        analysisId: 'analysis_001',
        detectedFoods: [
          { label: 'Riz complet', confidence: 0.88 },
          { label: 'Poulet grillé', confidence: 0.76 },
          { label: 'Légumes verts', confidence: 0.69 },
          { label: 'Sauce yaourt', confidence: 0.62 }
        ],
        nutrition: {
          calories: 620,
          protein: 42,
          carbs: 78,
          fat: 14
        },
        imbalances: ['Glucides élevés', 'Apport en protéines correct', 'Fibres légèrement basses'],
        suggestions: [
          'Ajouter une portion de légumes verts supplémentaire',
          'Réduire légèrement la portion de riz',
          'Conserver la source de protéines maigres'
        ],
        explanation:
          'Analyse estimée : le modèle vision local n’est pas disponible, le résultat est généré par un fallback frontend.',
        model: 'healthai-vision-demo',
        createdAt: new Date().toISOString(),
        fallbackUsed: true
      };
    }
  );
}

function buildMealAnalysisFormData(request: MealAnalysisRequest) {
  if (!request.file) {
    throw new Error('Aucun fichier image a envoyer.');
  }

  const formData = new FormData();
  formData.append('userId', 'profile_demo_001');
  formData.append('file', request.file);
  if (request.fileName) {
    formData.append('fileName', request.fileName);
  }
  return formData;
}

export async function generateNutritionRecommendation(
  request: NutritionRecommendationRequest
): Promise<NutritionRecommendation> {
  return withApiFallback(
    () =>
      httpClient<NutritionRecommendation>('/ai/nutrition/recommend', {
        method: 'POST',
        body: JSON.stringify(request),
        fallbackLabel: 'Recommandation nutrition indisponible'
      }),
    async () => {
      await mockDelay(750);
      return {
        recommendationId: 'rec_001',
        type: 'nutrition',
        title: 'Repas équilibré pour perte de poids',
        score: 0.87,
        mealPlan: ['Poulet grillé', 'Riz complet', 'Légumes verts', 'Yaourt nature', 'Fruit frais'],
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
          'Préparer les féculents en avance pour stabiliser les portions',
          'Ajouter des crudités si la faim persiste',
          'Boire un verre d’eau avant le repas pour mieux évaluer la satiété'
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
      httpClient<SportRecommendation>('/ai/sport/recommend', {
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
        title: 'Programme cardio débutant sans matériel',
        score: 0.84,
        duration: request.duration || 30,
        intensity: request.fatigue === 'elevee' ? 'low' : 'medium',
        exercises: [
          { name: 'Marche rapide', duration: 15, intensity: 'low', note: 'Rythme respiratoire confortable' },
          { name: 'Gainage adapté', duration: 5, intensity: 'medium', note: 'Séries courtes, dos neutre' },
          { name: 'Squat adapté', duration: 8, intensity: 'medium', note: 'Amplitude réduite si douleur' },
          { name: 'Retour au calme', duration: 2, intensity: 'low', note: 'Respiration lente et mobilite' }
        ],
        explanation:
          'Programme adapté à un objectif de perte de graisse, sans matériel et avec une intensité modérée pour favoriser la régularité.',
        warning: hasLimitation
          ? 'Limitation déclarée prise en compte : éviter toute douleur vive et réduire l’amplitude des mouvements.'
          : undefined,
        model: 'healthai-sport-demo-v0.2'
      };
    }
  );
}
