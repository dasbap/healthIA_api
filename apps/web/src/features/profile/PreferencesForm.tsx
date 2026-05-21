import { FormEvent, useState } from 'react';
import type { UserProfile } from '../../api/usersApi';
import { updateUserProfile } from '../../api/usersApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export function PreferencesForm({ profile }: { profile: UserProfile }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    await updateUserProfile({
      ...profile,
      age: Number(form.get('age')),
      heightCm: Number(form.get('heightCm')),
      weightKg: Number(form.get('weightKg')),
      mainGoal: String(form.get('mainGoal')),
      allergies: String(form.get('allergies')).split(',').map((item) => item.trim()).filter(Boolean),
      restrictions: String(form.get('restrictions')).split(',').map((item) => item.trim()).filter(Boolean),
      budgetPerWeek: Number(form.get('budgetPerWeek')),
      availableEquipment: String(form.get('availableEquipment')).split(',').map((item) => item.trim()).filter(Boolean),
      physicalLimitations: String(form.get('physicalLimitations')).split(',').map((item) => item.trim()).filter(Boolean),
      sportPreferences: String(form.get('sportPreferences')).split(',').map((item) => item.trim()).filter(Boolean)
    });
    setIsSaved(true);
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Preferences personnelles</h2>
          <p>Donnees fictives conservees localement pour preparer le futur profil API.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit}>
        <Input label="Age" name="age" type="number" defaultValue={profile.age} />
        <Input label="Taille (cm)" name="heightCm" type="number" defaultValue={profile.heightCm} />
        <Input label="Poids (kg)" name="weightKg" type="number" defaultValue={profile.weightKg} />
        <Select
          label="Objectif principal"
          name="mainGoal"
          defaultValue={profile.mainGoal}
          options={[
            { label: 'Perte de graisse progressive', value: 'Perte de graisse progressive' },
            { label: 'Maintien forme et energie', value: 'Maintien forme et energie' },
            { label: 'Renforcement musculaire', value: 'Renforcement musculaire' },
            { label: 'Sante generale', value: 'Sante generale' }
          ]}
        />
        <Input label="Allergies" name="allergies" defaultValue={profile.allergies.join(', ')} />
        <Input label="Restrictions" name="restrictions" defaultValue={profile.restrictions.join(', ')} />
        <Input label="Budget hebdomadaire" name="budgetPerWeek" type="number" defaultValue={profile.budgetPerWeek} />
        <Input label="Materiel disponible" name="availableEquipment" defaultValue={profile.availableEquipment.join(', ')} />
        <Input label="Limitations physiques" name="physicalLimitations" defaultValue={profile.physicalLimitations.join(', ')} />
        <Input label="Preferences sportives" name="sportPreferences" defaultValue={profile.sportPreferences.join(', ')} />
        <div className="form-actions">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer les preferences'}
          </Button>
        </div>
        {isSaved ? <Alert tone="success" title="Profil mis a jour">Modification simulee en mode demo.</Alert> : null}
      </form>
    </Card>
  );
}
