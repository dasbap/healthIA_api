import { ApiError, httpClient, mockDelay, withApiFallback } from './httpClient';

export type RecommendationType = 'nutrition' | 'sport' | 'meal-analysis';
export type RecommendationStatus = 'completed' | 'reviewed' | 'flagged';

export type RecommendationHistoryItem = {
  id: string;
  type: RecommendationType;
  title: string;
  score: number;
  status: RecommendationStatus;
  createdAt: string;
  summary: string;
};

export type RecommendationDetail = RecommendationHistoryItem & {
  userInput: string;
  aiResult: string;
  explanation: string;
  model: string;
  modelVersion: string;
  signals: string[];
};

export const mockRecommendations: RecommendationDetail[] = [
  {
    id: 'rec_001',
    type: 'nutrition',
    title: 'Repas équilibré pour perte de poids',
    score: 0.87,
    status: 'completed',
    createdAt: '2026-05-20T08:30:00.000Z',
    summary: 'Plan riche en protéines, budget respecté, glucides ajustés.',
    userInput: 'Objectif perte de graisse, 560 kcal, budget 65 euros/semaine, allergie noisettes.',
    aiResult: 'Poulet grillé, riz complet, légumes verts, yaourt nature et fruit frais.',
    explanation:
      'La recommandation favorise les protéines maigres, conserve une portion contrôlée de féculents et respecte les contraintes budgétaires.',
    model: 'healthai-nutrition-demo',
    modelVersion: '0.3.0',
    signals: ['Objectif calorique respecté', 'Allergies filtrées', 'Budget compatible']
  },
  {
    id: 'rec_002',
    type: 'sport',
    title: 'Programme cardio débutant sans matériel',
    score: 0.84,
    status: 'reviewed',
    createdAt: '2026-05-19T17:10:00.000Z',
    summary: '30 minutes bas impact avec limitation genou prise en compte.',
    userInput: 'Perte de graisse, niveau débutant, 30 minutes, genou droit sensible.',
    aiResult: 'Marche rapide, gainage adapté, squat amplitude réduite, retour au calme.',
    explanation:
      'La séance limite les impacts et garde une intensité modérée pour améliorer l’adhérence et réduire le risque de douleur.',
    model: 'healthai-sport-demo',
    modelVersion: '0.2.0',
    signals: ['Bas impact', 'Sans matériel', 'Fatigue modérée']
  },
  {
    id: 'analysis_001',
    type: 'meal-analysis',
    title: 'Analyse bol riz poulet légumes',
    score: 0.78,
    status: 'flagged',
    createdAt: '2026-05-18T12:05:00.000Z',
    summary: '620 kcal estimées, glucides élevés, protéines correctes.',
    userInput: 'Photo repas déjeuner : bol de riz, poulet et légumes verts.',
    aiResult: 'Riz complet, poulet grillé, légumes verts, sauce yaourt.',
    explanation:
      'Le modèle détecte une portion importante de féculents et propose d’augmenter les légumes pour équilibrer la densité énergétique.',
    model: 'healthai-vision-demo',
    modelVersion: '0.1.0',
    signals: ['Confiance moyenne 74%', 'Glucides élevés', 'Fibres à renforcer']
  },
  {
    id: 'rec_003',
    type: 'nutrition',
    title: 'Petit-déjeuner protéiné rapide',
    score: 0.91,
    status: 'completed',
    createdAt: '2026-05-16T07:40:00.000Z',
    summary: 'Option simple, rassasiante, compatible matin pressé.',
    userInput: 'Petit-déjeuner moins de 10 minutes, riche en protéines, sans noisettes.',
    aiResult: 'Skyr nature, flocons d’avoine, fruits rouges, graines de chia.',
    explanation:
      'Le repas apporte une base protéinée et des fibres tout en restant rapide à préparer.',
    model: 'healthai-nutrition-demo',
    modelVersion: '0.3.0',
    signals: ['Préparation rapide', 'Bonne satiété', 'Allergies filtrées']
  }
];

export async function getRecommendationHistory(userId = 'profile_demo_001'): Promise<RecommendationHistoryItem[]> {
  return withApiFallback(
    () =>
      httpClient<RecommendationHistoryItem[]>(`/ai/recommendations/${userId}`, {
        fallbackLabel: 'Historique indisponible'
      }),
    async () => {
      await mockDelay(300);
      return mockRecommendations;
    }
  );
}

export async function getRecommendationDetail(id: string): Promise<RecommendationDetail> {
  return withApiFallback(
    () =>
      httpClient<RecommendationDetail>(`/ai/recommendations/detail/${id}`, {
        fallbackLabel: 'Détail indisponible'
      }),
    async () => {
      await mockDelay(250);
      const recommendation = mockRecommendations.find((item) => item.id === id);

      if (!recommendation) {
        throw new ApiError('Recommandation introuvable', 404);
      }

      return recommendation;
    }
  );
}

export async function sendFeedback(id: string, rating: number, comment: string): Promise<{ ok: boolean }> {
  return withApiFallback(
    () =>
      httpClient<{ ok: boolean }>(`/ai/recommendations/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
        fallbackLabel: 'Feedback indisponible'
      }),
    async () => {
      await mockDelay(350);
      return { ok: true };
    }
  );
}
