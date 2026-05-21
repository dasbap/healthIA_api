import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SportRecommendPage } from '../features/sport/SportRecommendPage';

describe('SportRecommendPage', () => {
  it('affiche le formulaire et un programme sportif fictif', async () => {
    render(<SportRecommendPage />);

    expect(screen.getByLabelText(/Niveau/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duree disponible/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Generer le programme/i }));

    expect(await screen.findByText(/Programme cardio debutant sans materiel/i)).toBeInTheDocument();
    expect(screen.getByText(/Marche rapide/i)).toBeInTheDocument();
    expect(screen.getByText(/Precaution/i)).toBeInTheDocument();
  });
});
