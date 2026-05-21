import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealAnalysisPage } from '../features/meal-analysis/MealAnalysisPage';

describe('MealAnalysisPage', () => {
  it('affiche le formulaire, le loading et le resultat d’analyse fictif', async () => {
    render(<MealAnalysisPage />);

    expect(screen.getByLabelText(/URL d’image/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Analyser le repas/i }));

    expect(screen.getByText(/modele vision demo analyse/i)).toBeInTheDocument();
    expect(await screen.findByText(/Riz complet/i)).toBeInTheDocument();
    expect(screen.getByText(/620 kcal/i)).toBeInTheDocument();
    expect(screen.getByText(/Glucides eleves/i)).toBeInTheDocument();
  });
});
