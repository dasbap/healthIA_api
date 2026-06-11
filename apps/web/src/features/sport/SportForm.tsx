import { FormEvent, useState } from 'react';
import type { SportRecommendationRequest } from '../../api/aiApi';
import type { UserProfile } from '../../api/usersApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

type SportFormProps = {
  profile: UserProfile;
  onSubmit: (payload: SportRecommendationRequest) => void;
  isLoading: boolean;
};

type SportFormErrors = Partial<Record<keyof SportRecommendationRequest, string>>;

function validatePayload(payload: SportRecommendationRequest) {
  const errors: SportFormErrors = {};

  if (!payload.goal.trim()) {
    errors.goal = 'Choisissez un objectif sportif.';
  }

  if (!payload.level.trim()) {
    errors.level = 'Choisissez un niveau.';
  }

  if (!Number.isFinite(payload.duration) || payload.duration < 10 || payload.duration > 120) {
    errors.duration = 'Indiquez une durée entre 10 et 120 minutes.';
  }

  if (!payload.fatigue.trim()) {
    errors.fatigue = 'Indiquez le niveau de fatigue actuel.';
  }

  return errors;
}

export function SportForm({ profile, onSubmit, isLoading }: SportFormProps) {
  const [errors, setErrors] = useState<SportFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      userId: profile.userId,
      goal: String(form.get('goal')),
      level: String(form.get('level')),
      duration: Number(form.get('duration')),
      sessionsPerWeek: Number(form.get('sessionsPerWeek')),
      equipment: String(form.get('equipment')),
      preferences: String(form.get('preferences')),
      limitations: String(form.get('limitations')),
      fatigue: String(form.get('fatigue'))
    };
    const nextErrors = validatePayload(payload);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(payload);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Profil sportif</h2>
          <p>Critères transmis au endpoint sport avec le profil courant.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 ? (
          <div className="span-two" aria-live="assertive">
            <Alert tone="warning" title="Formulaire à compléter">
              Corrigez les champs signalés avant de générer le programme.
            </Alert>
          </div>
        ) : null}
        <Select
          label="Objectif"
          name="goal"
          defaultValue={profile.goal}
          required
          error={errors.goal}
          hint="Adapte l’intensité et les exercices."
          options={[
            { label: 'Perte de graisse', value: 'perte de graisse' },
            { label: 'Renforcement', value: 'renforcement' },
            { label: 'Endurance', value: 'endurance' },
            { label: 'Santé générale', value: 'sante generale' }
          ]}
        />
        <Select
          label="Niveau"
          name="level"
          defaultValue={profile.sportLevel}
          required
          error={errors.level}
          options={[
            { label: 'Débutant', value: 'debutant' },
            { label: 'Intermédiaire', value: 'intermediaire' },
            { label: 'Avancé', value: 'avance' }
          ]}
        />
        <Input
          label="Durée disponible (min)"
          name="duration"
          type="number"
          defaultValue={profile.durationMinutes}
          min={10}
          max={120}
          required
          error={errors.duration}
          hint="Entre 10 et 120 minutes."
        />
        <Input
          label="Séances par semaine"
          name="sessionsPerWeek"
          type="number"
          defaultValue={profile.sessionsPerWeek}
          min={1}
          max={7}
          hint="Utilisé par l’API IA pour ajuster le volume d’entraînement."
        />
        <Input label="Matériel" name="equipment" defaultValue={profile.equipment.join(', ')} />
        <Textarea
          label="Préférences"
          name="preferences"
          defaultValue={profile.sportPreferences.join(', ')}
          rows={3}
          hint="Activités appréciées ou à éviter."
        />
        <Textarea
          label="Limitations physiques"
          name="limitations"
          defaultValue={profile.physicalLimitations.join(', ')}
          rows={3}
          hint="Douleurs, blessures ou mouvements à éviter."
        />
        <Select
          label="Fatigue actuelle"
          name="fatigue"
          defaultValue="moderee"
          required
          error={errors.fatigue}
          options={[
            { label: 'Faible', value: 'faible' },
            { label: 'Modérée', value: 'moderee' },
            { label: 'Élevée', value: 'elevee' }
          ]}
        />
        <div className="form-actions span-two">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Génération...' : 'Générer le programme'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
