import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { analyzeMeal, type MealAnalysisResponse } from '../api/aiApi';
import { MealAnalysisPage } from '../features/meal-analysis/MealAnalysisPage';

vi.mock('../api/aiApi', () => ({
  analyzeMeal: vi.fn()
}));

describe('MealAnalysisPage', () => {
  const analyzeMealMock = vi.mocked(analyzeMeal);

  beforeEach(() => {
    analyzeMealMock.mockReset();
    analyzeMealMock.mockResolvedValue(mockMealAnalysisResponse());
  });

  it('affiche le formulaire, le loading et le resultat d’analyse fictif', async () => {
    let resolveAnalysis: (response: MealAnalysisResponse) => void = () => undefined;
    analyzeMealMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAnalysis = resolve;
      })
    );

    render(<MealAnalysisPage />);

    expect(screen.getByLabelText(/URL d’image/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Analyser le repas/i }));

    expect(screen.getByText(/modèle vision analyse/i)).toBeInTheDocument();
    resolveAnalysis(mockMealAnalysisResponse());
    expect(await screen.findByText(/Riz complet/i)).toBeInTheDocument();
    expect(screen.getByText(/620 kcal/i)).toBeInTheDocument();
    expect(screen.getByText(/Glucides élevés/i)).toBeInTheDocument();
  });

  it('accepte une image déposée par glisser-déposer', async () => {
    render(<MealAnalysisPage />);

    const dropZone = screen.getByText(/Glisser-déposer une photo/i).closest('label');
    const file = new File(['repas'], 'assiette-sante.png', { type: 'image/png' });

    expect(dropZone).not.toBeNull();

    await userEvent.clear(screen.getByLabelText(/URL d’image/i));
    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [file]
      }
    });

    expect(screen.getByText('assiette-sante.png')).toBeInTheDocument();
  });

  it('envoie un fichier image et affiche le statut fallback backend', async () => {
    analyzeMealMock.mockResolvedValueOnce(
      mockMealAnalysisResponse({
        analysisId: 'rec_meal_upload',
        detectedFoods: [{ label: 'repas mixte', confidence: 0.55 }],
        nutrition: { calories: 520, protein: 24, carbs: 62, fat: 18 },
        imbalances: ['Glucides eleves'],
        suggestions: ['Verifier les portions si l’estimation semble trop haute.'],
        explanation: 'Analyse estimee depuis fichier image recu.',
        model: 'healthai-vision-fallback-v1',
        fallbackUsed: true
      })
    );

    render(<MealAnalysisPage />);

    const file = new File([PNG_BYTES], 'assiette-sante.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Glisser-déposer une photo/i, { selector: 'input' });

    await userEvent.clear(screen.getByLabelText(/URL d’image/i));
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole('button', { name: /Analyser le repas/i }));

    expect((await screen.findAllByText(/Analyse estimée/i)).length).toBeGreaterThan(0);
    expect(analyzeMealMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'demo-user',
        file,
        fileName: 'assiette-sante.png'
      })
    );
  });
});

function mockMealAnalysisResponse(overrides: Partial<MealAnalysisResponse> = {}): MealAnalysisResponse {
  return {
    analysisId: 'analysis_001',
    detectedFoods: [
      { label: 'Riz complet', confidence: 0.88 },
      { label: 'Poulet grillé', confidence: 0.76 },
      { label: 'Légumes verts', confidence: 0.69 }
    ],
    nutrition: {
      calories: 620,
      protein: 42,
      carbs: 78,
      fat: 14
    },
    imbalances: ['Glucides élevés', 'Apport en protéines correct'],
    suggestions: ['Ajouter une portion de légumes verts supplémentaire', 'Réduire légèrement la portion de riz'],
    explanation: 'Analyse repas demo pour les tests frontend.',
    model: 'healthai-vision-demo',
    createdAt: new Date().toISOString(),
    fallbackUsed: false,
    ...overrides
  };
}

const PNG_BYTES = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144,
  119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 120, 156, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 65, 226, 31,
  155, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);
