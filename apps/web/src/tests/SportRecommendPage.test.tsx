import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { generateSportRecommendation } from '../api/aiApi';
import { defaultUserProfile } from '../api/usersApi';
import { SportRecommendPage } from '../features/sport/SportRecommendPage';

vi.mock('../api/aiApi', () => ({
  generateSportRecommendation: vi.fn()
}));

describe('SportRecommendPage', () => {
  const generateSportMock = vi.mocked(generateSportRecommendation);

  beforeEach(() => {
    localStorage.clear();
    generateSportMock.mockReset();
    generateSportMock.mockResolvedValue({
      recommendationId: 'rec_sport_api',
      type: 'sport',
      title: 'Programme API personnalisé',
      score: 0.84,
      duration: 30,
      intensity: 'low',
      exercises: [{ name: 'Marche rapide', duration: 15, intensity: 'low', note: 'Rythme confortable' }],
      explanation: 'Réponse API sport.',
      warning: 'Limiter les impacts.',
      model: 'healthai-sport-recommender-v1',
      createdAt: new Date().toISOString(),
      fallbackUsed: false
    });
  });

  it('envoie le userId du profil et affiche le moteur backend sans faux message indisponible', async () => {
    localStorage.setItem(
      'healthai_profile',
      JSON.stringify({ ...defaultUserProfile, userId: 'sport-user', sportLevel: 'debutant' })
    );
    render(<SportRecommendPage />);

    expect(screen.getByLabelText(/Niveau/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Durée disponible/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Générer le programme/i }));

    expect(generateSportMock).toHaveBeenCalledWith(expect.objectContaining({ userId: 'sport-user' }));
    expect(await screen.findByText(/Programme API personnalisé/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommandation générée par l’API IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Moteur sport HealthAI/i)).toBeInTheDocument();
    expect(screen.queryByText(/API IA indisponible/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Marche rapide/i).length).toBeGreaterThan(0);
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
