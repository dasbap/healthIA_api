import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecommendationDetailPage } from '../features/recommendations/RecommendationDetailPage';

function renderWithProviders(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/recommendations/:id" element={<RecommendationDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RecommendationDetailPage', () => {
  it('affiche un message clair si la recommandation est introuvable', async () => {
    renderWithProviders('/recommendations/inconnue');

    expect(await screen.findByText(/Recommandation introuvable/i)).toBeInTheDocument();
  });
});
