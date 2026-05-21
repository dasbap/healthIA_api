import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NutritionRecommendPage } from '../features/nutrition/NutritionRecommendPage';

describe('NutritionRecommendPage', () => {
  it('affiche le formulaire et le resultat fictif apres generation', async () => {
    render(<NutritionRecommendPage />);

    expect(screen.getByLabelText(/Objectif/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calories cibles/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Generer la recommandation/i }));

    expect(await screen.findByText(/Repas equilibre pour perte de poids/i)).toBeInTheDocument();
    expect(screen.getByText(/Poulet grille/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Budget/i).length).toBeGreaterThan(0);
  });
});
