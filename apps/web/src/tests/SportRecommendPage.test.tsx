import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SportRecommendPage } from '../features/sport/SportRecommendPage';

describe('SportRecommendPage', () => {
  it('affiche le formulaire et un programme sportif fictif', async () => {
    render(<SportRecommendPage />);

    expect(screen.getByLabelText(/Niveau/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Durée disponible/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Générer le programme/i }));

    expect(await screen.findByText(/Programme cardio débutant sans matériel/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Marche rapide/i).length).toBeGreaterThan(1);
    expect(screen.getByText(/Précaution/i)).toBeInTheDocument();
  });

  it('affiche une erreur si la durée est hors limites', async () => {
    render(<SportRecommendPage />);

    await userEvent.clear(screen.getByLabelText(/Durée disponible/i));
    await userEvent.type(screen.getByLabelText(/Durée disponible/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /Générer le programme/i }));

    expect(screen.getByText(/durée entre 10 et 120 minutes/i)).toBeInTheDocument();
  });
});
