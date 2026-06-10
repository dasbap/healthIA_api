import { FormEvent, useState } from 'react';
import type { UserProfile } from '../../api/usersApi';
import { updateUserProfile } from '../../api/usersApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

function splitTags(value: FormDataEntryValue | null) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PreferencesForm({ profile }: { profile: UserProfile }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    setError('');

    try {
      await updateUserProfile({
        ...profile,
        age: Number(form.get('age')),
        heightCm: Number(form.get('heightCm')),
        weightKg: Number(form.get('weightKg')),
        mainGoal: String(form.get('mainGoal')),
        allergies: splitTags(form.get('allergies')),
        restrictions: splitTags(form.get('restrictions')),
        budgetPerWeek: Number(form.get('budgetPerWeek')),
        availableEquipment: splitTags(form.get('availableEquipment')),
        physicalLimitations: splitTags(form.get('physicalLimitations')),
        sportPreferences: splitTags(form.get('sportPreferences'))
      });
      setIsSaved(true);
    } catch {
      setError('La sauvegarde du profil n’a pas abouti. En mode démo, elle est simulée dans le navigateur.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Préférences personnelles</h2>
          <p>Données fictives conservées localement pour préparer le futur profil API.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit}>
        {error ? <div className="span-two"><Alert tone="danger" title="Profil non sauvegardé">{error}</Alert></div> : null}
        <Input label="Age" name="age" type="number" defaultValue={profile.age} min={13} required />
        <Input label="Taille (cm)" name="heightCm" type="number" defaultValue={profile.heightCm} min={120} required />
        <Input label="Poids (kg)" name="weightKg" type="number" defaultValue={profile.weightKg} min={30} required />
        <Select
          label="Objectif principal"
          name="mainGoal"
          defaultValue={profile.mainGoal}
          required
          options={[
            { label: 'Perte de graisse progressive', value: 'Perte de graisse progressive' },
            { label: 'Maintien forme et énergie', value: 'Maintien forme et energie' },
            { label: 'Renforcement musculaire', value: 'Renforcement musculaire' },
            { label: 'Santé générale', value: 'Sante generale' }
          ]}
        />
        <Input label="Budget hebdomadaire" name="budgetPerWeek" type="number" defaultValue={profile.budgetPerWeek} min={10} required />
        <Textarea label="Allergies" name="allergies" defaultValue={profile.allergies.join(', ')} rows={3} hint="Séparez les valeurs par des virgules." />
        <Textarea label="Restrictions" name="restrictions" defaultValue={profile.restrictions.join(', ')} rows={3} />
        <Textarea label="Matériel disponible" name="availableEquipment" defaultValue={profile.availableEquipment.join(', ')} rows={3} />
        <Textarea label="Limitations physiques" name="physicalLimitations" defaultValue={profile.physicalLimitations.join(', ')} rows={3} />
        <Textarea label="Préférences sportives" name="sportPreferences" defaultValue={profile.sportPreferences.join(', ')} rows={3} />
        <div className="form-actions span-two">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </Button>
        </div>
        {isSaved ? <div className="span-two"><Alert tone="success" title="Profil mis à jour">Modification simulée en mode démo et conservée dans le navigateur.</Alert></div> : null}
      </form>
    </Card>
  );
}
