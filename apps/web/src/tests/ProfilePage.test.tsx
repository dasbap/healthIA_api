import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Topbar } from '../components/layout/Topbar';
import { defaultUserProfile } from '../api/usersApi';
import { ProfilePage } from '../features/profile/ProfilePage';

function renderProfileWithTopbar() {
  return render(
    <>
      <Topbar onMenuClick={() => undefined} apiStatusLabel="API IA active" />
      <ProfilePage />
    </>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('modifie le profil local et met a jour la topbar', async () => {
    renderProfileWithTopbar();

    expect(screen.getAllByText(/Camille Martin/i).length).toBeGreaterThan(0);

    await userEvent.clear(screen.getByLabelText(/Nom/i));
    await userEvent.type(screen.getByLabelText(/Nom/i), 'Alex Martin');
    await userEvent.clear(screen.getByLabelText(/Email/i));
    await userEvent.type(screen.getByLabelText(/Email/i), 'alex@healthai.local');
    await userEvent.clear(screen.getByLabelText(/UserId/i));
    await userEvent.type(screen.getByLabelText(/UserId/i), 'user-alex');

    await userEvent.click(screen.getByRole('button', { name: /Enregistrer les préférences/i }));

    expect(await screen.findByText(/Profil mis à jour/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Alex Martin/i).length).toBeGreaterThan(0);
    expect(localStorage.getItem('healthai_profile')).toContain('user-alex');
    expect(localStorage.getItem('healthai_profile')).toContain('alex@healthai.local');
  });

  it('cree un profil par defaut si aucun profil local n’existe', () => {
    renderProfileWithTopbar();

    expect(screen.getByLabelText(/UserId/i)).toHaveValue(defaultUserProfile.userId);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(defaultUserProfile.email);
  });
});
