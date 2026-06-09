import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealAnalysisPage } from '../features/meal-analysis/MealAnalysisPage';

describe('MealAnalysisPage', () => {
  it('affiche le formulaire, le loading et le resultat d’analyse fictif', async () => {
    render(<MealAnalysisPage />);

    expect(screen.getByLabelText(/URL d’image/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Analyser le repas/i }));

    expect(screen.getByText(/modèle vision démo analyse/i)).toBeInTheDocument();
    expect(await screen.findByText(/Riz complet/i)).toBeInTheDocument();
    expect(screen.getByText(/620 kcal/i)).toBeInTheDocument();
    expect(screen.getByText(/Glucides élevés/i)).toBeInTheDocument();
  });

  it('accepte une image déposée par glisser-déposer', async () => {
    render(<MealAnalysisPage />);

    const dropZone = screen.getByText(/Glisser-déposer une photo/i).closest('label');
    const file = new File(['repas'], 'assiette-sante.png', { type: 'image/png' });

    expect(dropZone).not.toBeNull();

    await userEvent.clear(screen.getByLabelText(/URL d’image/i));
    fireEvent.drop(dropZone as HTMLLabelElement, {
      dataTransfer: {
        files: [file]
      }
    });

    expect(screen.getByText('assiette-sante.png')).toBeInTheDocument();
  });
});
