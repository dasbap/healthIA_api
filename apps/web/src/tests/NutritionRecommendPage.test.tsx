import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NutritionRecommendPage } from '../features/nutrition/NutritionRecommendPage';

describe('NutritionRecommendPage', () => {
  it('affiche le formulaire et le resultat fictif apres generation', async () => {
    render(<NutritionRecommendPage />);

    expect(screen.getByLabelText(/Objectif/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calories cibles/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Générer la recommandation/i }));

    expect(await screen.findByText(/Repas équilibré pour perte de poids/i)).toBeInTheDocument();
    expect(screen.getByText(/Poulet grillé/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Budget/i).length).toBeGreaterThan(0);
  });

  it('affiche une erreur si les calories cibles sont invalides', async () => {
    render(<NutritionRecommendPage />);

    await userEvent.clear(screen.getByLabelText(/Calories cibles/i));
    await userEvent.type(screen.getByLabelText(/Calories cibles/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /Générer la recommandation/i }));

    expect(screen.getByText(/valeur entre 300 et 2000 kcal/i)).toBeInTheDocument();
  });
});
