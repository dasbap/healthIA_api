import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RecommendationHistoryPage } from '../features/recommendations/RecommendationHistoryPage';

function renderWithProviders() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RecommendationHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RecommendationHistoryPage', () => {
  it('affiche l’historique et filtre les recommandations sportives', async () => {
    renderWithProviders();

    expect(await screen.findByText(/Repas equilibre pour perte de poids/i)).toBeInTheDocument();
    expect(screen.getByText(/Programme cardio debutant/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/Type/i), 'sport');

    expect(screen.getByText(/Programme cardio debutant/i)).toBeInTheDocument();
    expect(screen.queryByText(/Petit-dejeuner proteine/i)).not.toBeInTheDocument();
  });
});
