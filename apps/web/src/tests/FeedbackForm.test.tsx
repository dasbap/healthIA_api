import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { sendFeedback } from '../api/recommendationsApi';
import { FeedbackForm } from '../features/recommendations/FeedbackForm';

vi.mock('../api/recommendationsApi', () => ({
  sendFeedback: vi.fn()
}));

describe('FeedbackForm', () => {
  const sendFeedbackMock = vi.mocked(sendFeedback);

  beforeEach(() => {
    sendFeedbackMock.mockReset();
    sendFeedbackMock.mockResolvedValue({ ok: true });
  });

  it('demande un commentaire avant envoi', async () => {
    render(<FeedbackForm recommendationId="rec_001" />);

    await userEvent.click(screen.getByRole('button', { name: /Envoyer le feedback/i }));

    expect(screen.getByText(/commentaire court/i)).toBeInTheDocument();
    expect(screen.getByText(/Commentaire attendu/i)).toBeInTheDocument();
  });

  it('envoie le userId, la note et le commentaire', async () => {
    render(<FeedbackForm recommendationId="rec_001" userId="feedback-user" />);

    await userEvent.selectOptions(screen.getByLabelText(/Note/i, { selector: 'select' }), '4');
    await userEvent.type(screen.getByLabelText(/Commentaire/i), 'Resultat utile.');
    await userEvent.click(screen.getByRole('button', { name: /Envoyer le feedback/i }));

    expect(sendFeedbackMock).toHaveBeenCalledWith('rec_001', 'feedback-user', 4, 'Resultat utile.');
    expect(await screen.findByText(/Feedback enregistré/i)).toBeInTheDocument();
  });
});
