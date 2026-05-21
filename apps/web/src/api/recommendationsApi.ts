import { httpClient, mockDelay, withApiFallback } from './httpClient';

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
    title: 'Repas equilibre pour perte de poids',
    score: 0.87,
    status: 'completed',
    createdAt: '2026-05-20T08:30:00.000Z',
    summary: 'Plan riche en proteines, budget respecte, glucides ajustes.',
    userInput: 'Objectif perte de graisse, 560 kcal, budget 65 euros/semaine, allergie noisettes.',
    aiResult: 'Poulet grille, riz complet, legumes verts, yaourt nature et fruit frais.',
    explanation:
      'La recommandation favorise les proteines maigres, conserve une portion controlee de feculents et respecte les contraintes budgetaires.',
    model: 'healthai-nutrition-demo',
    modelVersion: '0.3.0',
    signals: ['Objectif calorique respecte', 'Allergies filtrees', 'Budget compatible']
  },
  {
    id: 'rec_002',
    type: 'sport',
    title: 'Programme cardio debutant sans materiel',
    score: 0.84,
    status: 'reviewed',
    createdAt: '2026-05-19T17:10:00.000Z',
    summary: '30 minutes bas impact avec limitation genou prise en compte.',
    userInput: 'Perte de graisse, niveau debutant, 30 minutes, genou droit sensible.',
    aiResult: 'Marche rapide, gainage adapte, squat amplitude reduite, retour au calme.',
    explanation:
      'La seance limite les impacts et garde une intensite moderee pour ameliorer l’adherence et reduire le risque de douleur.',
    model: 'healthai-sport-demo',
    modelVersion: '0.2.0',
    signals: ['Bas impact', 'Sans materiel', 'Fatigue moderee']
  },
  {
    id: 'analysis_001',
    type: 'meal-analysis',
    title: 'Analyse bol riz poulet legumes',
    score: 0.78,
    status: 'flagged',
    createdAt: '2026-05-18T12:05:00.000Z',
    summary: '620 kcal estimees, glucides eleves, proteines correctes.',
    userInput: 'Photo repas dejeuner: bol de riz, poulet et legumes verts.',
    aiResult: 'Riz complet, poulet grille, legumes verts, sauce yaourt.',
    explanation:
      'Le modele detecte une portion importante de feculents et propose d’augmenter les legumes pour equilibrer la densite energetique.',
    model: 'healthai-vision-demo',
    modelVersion: '0.1.0',
    signals: ['Confiance moyenne 74%', 'Glucides eleves', 'Fibres a renforcer']
  },
  {
    id: 'rec_003',
    type: 'nutrition',
    title: 'Petit-dejeuner proteine rapide',
    score: 0.91,
    status: 'completed',
    createdAt: '2026-05-16T07:40:00.000Z',
    summary: 'Option simple, rassasiante, compatible matin presse.',
    userInput: 'Petit-dejeuner moins de 10 minutes, riche en proteines, sans noisettes.',
    aiResult: 'Skyr nature, flocons d’avoine, fruits rouges, graines de chia.',
    explanation:
      'Le repas apporte une base proteinee et des fibres tout en restant rapide a preparer.',
    model: 'healthai-nutrition-demo',
    modelVersion: '0.3.0',
    signals: ['Preparation rapide', 'Bonne satiete', 'Allergies filtrees']
  }
];

export async function getRecommendationHistory(): Promise<RecommendationHistoryItem[]> {
  return withApiFallback(
    () => httpClient<RecommendationHistoryItem[]>('/recommendations', { fallbackLabel: 'Historique indisponible' }),
    async () => {
      await mockDelay(300);
      return mockRecommendations;
    }
  );
}

export async function getRecommendationDetail(id: string): Promise<RecommendationDetail> {
  return withApiFallback(
    () => httpClient<RecommendationDetail>(`/recommendations/${id}`, { fallbackLabel: 'Detail indisponible' }),
    async () => {
      await mockDelay(250);
      return mockRecommendations.find((item) => item.id === id) ?? mockRecommendations[0];
    }
  );
}

export async function sendFeedback(id: string, rating: number, comment: string): Promise<{ ok: boolean }> {
  return withApiFallback(
    () =>
      httpClient<{ ok: boolean }>(`/recommendations/${id}/feedback`, {
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
