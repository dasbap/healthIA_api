import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from '../features/recommendations/FeedbackForm';

describe('FeedbackForm', () => {
  it('demande un commentaire avant envoi', async () => {
    render(<FeedbackForm recommendationId="rec_001" />);

    await userEvent.click(screen.getByRole('button', { name: /Envoyer le feedback/i }));

    expect(screen.getByText(/commentaire court/i)).toBeInTheDocument();
    expect(screen.getByText(/Commentaire attendu/i)).toBeInTheDocument();
  });
});
