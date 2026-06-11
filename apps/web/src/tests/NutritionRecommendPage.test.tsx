import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { generateNutritionRecommendation } from '../api/aiApi';
import { defaultUserProfile } from '../api/usersApi';
import { NutritionRecommendPage } from '../features/nutrition/NutritionRecommendPage';

vi.mock('../api/aiApi', () => ({
  generateNutritionRecommendation: vi.fn()
}));

describe('NutritionRecommendPage', () => {
  const generateNutritionMock = vi.mocked(generateNutritionRecommendation);

  beforeEach(() => {
    localStorage.clear();
    generateNutritionMock.mockReset();
    generateNutritionMock.mockResolvedValue({
      recommendationId: 'rec_nutrition_api',
      type: 'nutrition',
      title: 'Repas API personnalisé',
      score: 0.87,
      mealPlan: ['Poulet', 'Riz', 'Légumes'],
      macros: { calories: 560, protein: 42, carbs: 59, fat: 16 },
      constraintsChecked: { allergies: true, diet: true, budget: true },
      explanation: 'Réponse API nutrition.',
      advice: ['Adapter les portions.'],
      model: 'healthai-nutrition-recommender-v1',
      createdAt: new Date().toISOString(),
      fallbackUsed: false
    });
  });

  it('envoie le userId du profil et affiche le moteur backend sans faux message indisponible', async () => {
    localStorage.setItem(
      'healthai_profile',
      JSON.stringify({ ...defaultUserProfile, userId: 'nutrition-user', name: 'Nora Test' })
    );
    render(<NutritionRecommendPage />);

    expect(screen.getByLabelText(/Objectif/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calories cibles/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Générer la recommandation/i }));

    expect(generateNutritionMock).toHaveBeenCalledWith(expect.objectContaining({ userId: 'nutrition-user' }));
    expect(await screen.findByText(/Repas API personnalisé/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommandation générée par l’API IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Moteur nutrition HealthAI/i)).toBeInTheDocument();
    expect(screen.queryByText(/API IA indisponible/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Poulet/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Budget/i).length).toBeGreaterThan(0);
  });

  it('affiche une erreur si les calories cibles sont invalides', async () => {
    render(<NutritionRecommendPage />);

    await userEvent.clear(screen.getByLabelText(/Calories cibles/i));
    await userEvent.type(screen.getByLabelText(/Calories cibles/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /Générer la recommandation/i }));

    expect(screen.getByText(/valeur entre 300 et 4000 kcal/i)).toBeInTheDocument();
  });
});
