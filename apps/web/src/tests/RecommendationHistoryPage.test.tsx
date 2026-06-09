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
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <RecommendationHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RecommendationHistoryPage', () => {
  it('affiche l’historique et filtre les recommandations sportives', async () => {
    renderWithProviders();

    expect(await screen.findByText(/Repas équilibré pour perte de poids/i)).toBeInTheDocument();
    expect(screen.getByText(/Programme cardio débutant/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/Type/i), 'sport');

    expect(screen.getByText(/Programme cardio débutant/i)).toBeInTheDocument();
    expect(screen.queryByText(/Petit-déjeuner protéiné/i)).not.toBeInTheDocument();
  });
});
