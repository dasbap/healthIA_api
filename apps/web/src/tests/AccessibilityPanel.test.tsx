import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AccessibilityPanel } from '../components/accessibility/AccessibilityPanel';
import { accessibilityStorageKey } from '../hooks/useAccessibilitySettings';

describe('AccessibilityPanel', () => {
  afterEach(() => {
    document.body.className = '';
    window.localStorage.clear();
  });

  it('affiche le panneau et applique le mode daltonien', async () => {
    render(<AccessibilityPanel />);

    await userEvent.click(screen.getByRole('button', { name: /Accessibilité/i }));
    await userEvent.click(screen.getByLabelText(/Mode daltonien/i));

    expect(document.body).toHaveClass('accessibility-colorblind');
    expect(window.localStorage.getItem(accessibilityStorageKey)).toContain('colorblindMode');
  });

  it('applique le contraste renforce et sauvegarde la taille du texte', async () => {
    render(<AccessibilityPanel />);

    await userEvent.click(screen.getByRole('button', { name: /Accessibilité/i }));
    await userEvent.click(screen.getByLabelText(/Contraste renforcé/i));
    await userEvent.selectOptions(screen.getByLabelText(/Taille du texte/i), 'extra-large');

    expect(document.body).toHaveClass('accessibility-high-contrast');
    expect(document.body).toHaveClass('accessibility-extra-large-text');
    expect(window.localStorage.getItem(accessibilityStorageKey)).toContain('extra-large');
  });

  it('reinitialise les preferences', async () => {
    render(<AccessibilityPanel />);

    await userEvent.click(screen.getByRole('button', { name: /Accessibilité/i }));
    await userEvent.click(screen.getByLabelText(/Réduire les animations/i));
    expect(document.body).toHaveClass('accessibility-reduced-motion');

    await userEvent.click(screen.getByRole('button', { name: /Réinitialiser les préférences/i }));
    expect(document.body).not.toHaveClass('accessibility-reduced-motion');
  });
});
