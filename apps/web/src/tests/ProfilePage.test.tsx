import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from '../features/profile/ProfilePage';

function renderWithProviders() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={client}>
      <ProfilePage />
    </QueryClientProvider>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('affiche le profil et confirme la sauvegarde locale', async () => {
    renderWithProviders();

    expect(await screen.findByText(/Camille Martin/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Enregistrer les préférences/i }));

    expect(await screen.findByText(/Profil mis à jour/i)).toBeInTheDocument();
    expect(localStorage.getItem('healthai_profile')).toContain('Camille Martin');
  });
});
