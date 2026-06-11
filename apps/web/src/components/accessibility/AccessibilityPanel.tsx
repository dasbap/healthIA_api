import { useEffect, useRef, useState } from 'react';
import { Accessibility, RotateCcw } from 'lucide-react';
import { useAccessibilitySettings, type TextSize } from '../../hooks/useAccessibilitySettings';
import { Button } from '../ui/Button';

const textSizeOptions: Array<{ value: TextSize; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grand' },
  { value: 'extra-large', label: 'Très grand' }
];

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { settings, setSetting, resetSettings } = useAccessibilitySettings();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.querySelector<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('button, input, select')?.focus();
    }
  }, [isOpen]);

  return (
    <div className="accessibility-menu">
      <Button
        type="button"
        variant="secondary"
        className="accessibility-trigger"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Accessibility size={18} aria-hidden="true" />
        Accessibilité
      </Button>
      {isOpen ? (
        <div id="accessibility-panel" className="accessibility-panel" ref={panelRef} role="dialog" aria-modal="false" aria-label="Préférences d’accessibilité">
          <div className="accessibility-panel-header">
            <h2>Accessibilité</h2>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.colorblindMode}
              onChange={(event) => setSetting('colorblindMode', event.target.checked)}
            />
            <span>
              <strong>Mode daltonien</strong>
              <small>Ajoute des libellés, contrastes et bordures plus explicites.</small>
            </span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => setSetting('highContrast', event.target.checked)}
            />
            <span>
              <strong>Contraste renforcé</strong>
              <small>Augmente le contraste et rend les zones interactives plus visibles.</small>
            </span>
          </label>
          <label className="field compact-field" htmlFor="accessibility-text-size">
            <span className="field-label">Taille du texte</span>
            <select
              id="accessibility-text-size"
              className="input select"
              value={settings.textSize}
              onChange={(event) => setSetting('textSize', event.target.value as TextSize)}
            >
              {textSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(event) => setSetting('reducedMotion', event.target.checked)}
            />
            <span>
              <strong>Réduire les animations</strong>
              <small>Limite les transitions et respecte les utilisateurs sensibles au mouvement.</small>
            </span>
          </label>
          <Button type="button" variant="ghost" onClick={resetSettings}>
            <RotateCcw size={17} aria-hidden="true" />
            Réinitialiser les préférences
          </Button>
        </div>
      ) : null}
    </div>
  );
}
