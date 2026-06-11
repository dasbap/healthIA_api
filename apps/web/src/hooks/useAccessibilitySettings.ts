import { useEffect, useMemo, useState } from 'react';

export type TextSize = 'normal' | 'large' | 'extra-large';

export type AccessibilitySettings = {
  colorblindMode: boolean;
  highContrast: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
};

const STORAGE_KEY = 'healthai-accessibility-settings';

export const defaultAccessibilitySettings: AccessibilitySettings = {
  colorblindMode: false,
  highContrast: false,
  textSize: 'normal',
  reducedMotion: false
};

function readSettings(): AccessibilitySettings {
  if (typeof window === 'undefined') {
    return defaultAccessibilitySettings;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultAccessibilitySettings;
    }
    return { ...defaultAccessibilitySettings, ...JSON.parse(stored) };
  } catch {
    return defaultAccessibilitySettings;
  }
}

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(readSettings);

  useEffect(() => {
    const classList = document.body.classList;
    classList.toggle('accessibility-colorblind', settings.colorblindMode);
    classList.toggle('accessibility-high-contrast', settings.highContrast);
    classList.toggle('accessibility-large-text', settings.textSize === 'large');
    classList.toggle('accessibility-extra-large-text', settings.textSize === 'extra-large');
    classList.toggle('accessibility-reduced-motion', settings.reducedMotion);
    document.documentElement.style.setProperty('--text-scale', settings.textSize === 'extra-large' ? '1.18' : settings.textSize === 'large' ? '1.09' : '1');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return useMemo(
    () => ({
      settings,
      setSetting<Key extends keyof AccessibilitySettings>(key: Key, value: AccessibilitySettings[Key]) {
        setSettings((current) => ({ ...current, [key]: value }));
      },
      resetSettings() {
        setSettings(defaultAccessibilitySettings);
      }
    }),
    [settings]
  );
}

export { STORAGE_KEY as accessibilityStorageKey };
