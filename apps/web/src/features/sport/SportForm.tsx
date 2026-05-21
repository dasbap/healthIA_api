import { FormEvent } from 'react';
import type { SportRecommendationRequest } from '../../api/aiApi';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

type SportFormProps = {
  onSubmit: (payload: SportRecommendationRequest) => void;
  isLoading: boolean;
};

export function SportForm({ onSubmit, isLoading }: SportFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      goal: String(form.get('goal')),
      level: String(form.get('level')),
      duration: Number(form.get('duration')),
      equipment: String(form.get('equipment')),
      preferences: String(form.get('preferences')),
      limitations: String(form.get('limitations')),
      fatigue: String(form.get('fatigue'))
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Profil sportif</h2>
          <p>Critères utilisateur pour un programme demo coherent et prudent.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit}>
        <Select
          label="Objectif"
          name="goal"
          defaultValue="perte de graisse"
          options={[
            { label: 'Perte de graisse', value: 'perte de graisse' },
            { label: 'Renforcement', value: 'renforcement' },
            { label: 'Endurance', value: 'endurance' },
            { label: 'Sante generale', value: 'sante generale' }
          ]}
        />
        <Select
          label="Niveau"
          name="level"
          defaultValue="debutant"
          options={[
            { label: 'Debutant', value: 'debutant' },
            { label: 'Intermediaire', value: 'intermediaire' },
            { label: 'Avance', value: 'avance' }
          ]}
        />
        <Input label="Duree disponible (min)" name="duration" type="number" defaultValue={30} min={10} max={120} />
        <Input label="Materiel" name="equipment" defaultValue="Sans materiel, tapis de sol" />
        <Input label="Preferences" name="preferences" defaultValue="Bas impact, marche rapide, gainage" />
        <Input label="Limitations physiques" name="limitations" defaultValue="Genou droit sensible" />
        <Select
          label="Fatigue actuelle"
          name="fatigue"
          defaultValue="moderee"
          options={[
            { label: 'Faible', value: 'faible' },
            { label: 'Moderee', value: 'moderee' },
            { label: 'Elevee', value: 'elevee' }
          ]}
        />
        <div className="form-actions">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generation...' : 'Generer le programme'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
