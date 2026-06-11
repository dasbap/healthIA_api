import { FormEvent, useState } from 'react';
import type { UserProfile } from '../../api/usersApi';
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

type PreferencesFormProps = {
  profile: UserProfile;
  onSave: (profile: UserProfile) => Promise<UserProfile>;
};

export function PreferencesForm({ profile, onSave }: PreferencesFormProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    setError('');

    try {
      await onSave({
        ...profile,
        userId: String(form.get('userId')).trim() || profile.userId,
        name: String(form.get('name')).trim() || profile.name,
        email: String(form.get('email')).trim() || profile.email,
        age: Number(form.get('age')),
        heightCm: Number(form.get('heightCm')),
        weightKg: Number(form.get('weightKg')),
        goal: String(form.get('goal')),
        activityLevel: String(form.get('activityLevel')),
        targetCalories: Number(form.get('targetCalories')),
        diet: String(form.get('diet')),
        allergies: splitTags(form.get('allergies')),
        dietaryRestrictions: splitTags(form.get('dietaryRestrictions')),
        foodPreferences: splitTags(form.get('foodPreferences')),
        budgetPerWeek: Number(form.get('budgetPerWeek')),
        sportLevel: String(form.get('sportLevel')),
        sessionsPerWeek: Number(form.get('sessionsPerWeek')),
        durationMinutes: Number(form.get('durationMinutes')),
        equipment: splitTags(form.get('equipment')),
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
        <Input label="UserId" name="userId" defaultValue={profile.userId} required hint="Identifiant transmis à tous les endpoints IA." />
        <Input label="Nom" name="name" defaultValue={profile.name} required />
        <Input label="Email" name="email" type="email" defaultValue={profile.email} required />
        <Input label="Age" name="age" type="number" defaultValue={profile.age} min={13} required />
        <Input label="Taille (cm)" name="heightCm" type="number" defaultValue={profile.heightCm} min={120} required />
        <Input label="Poids (kg)" name="weightKg" type="number" defaultValue={profile.weightKg} min={30} required />
        <Select
          label="Objectif principal"
          name="goal"
          defaultValue={profile.goal}
          required
          options={[
            { label: 'Perte de graisse', value: 'perte de graisse' },
            { label: 'Maintien du poids', value: 'maintien' },
            { label: 'Prise de masse maigre', value: 'prise de masse' },
            { label: 'Equilibre general', value: 'equilibre' }
          ]}
        />
        <Select
          label="Niveau d’activité"
          name="activityLevel"
          defaultValue={profile.activityLevel}
          options={[
            { label: 'Faible', value: 'faible' },
            { label: 'Modérée', value: 'moderee' },
            { label: 'Élevée', value: 'elevee' }
          ]}
        />
        <Input label="Calories cibles" name="targetCalories" type="number" defaultValue={profile.targetCalories} min={300} max={4000} required />
        <Select
          label="Régime alimentaire"
          name="diet"
          defaultValue={profile.diet}
          options={[
            { label: 'Omnivore', value: 'omnivore' },
            { label: 'Végétarien', value: 'vegetarien' },
            { label: 'Flexitarien', value: 'flexitarien' },
            { label: 'Sans lactose', value: 'sans lactose' }
          ]}
        />
        <Input label="Budget hebdomadaire" name="budgetPerWeek" type="number" defaultValue={profile.budgetPerWeek} min={10} required />
        <Textarea label="Allergies" name="allergies" defaultValue={profile.allergies.join(', ')} rows={3} hint="Séparez les valeurs par des virgules." />
        <Textarea label="Restrictions alimentaires" name="dietaryRestrictions" defaultValue={profile.dietaryRestrictions.join(', ')} rows={3} />
        <Textarea label="Préférences alimentaires" name="foodPreferences" defaultValue={profile.foodPreferences.join(', ')} rows={3} />
        <Select
          label="Niveau sportif"
          name="sportLevel"
          defaultValue={profile.sportLevel}
          options={[
            { label: 'Débutant', value: 'debutant' },
            { label: 'Intermédiaire', value: 'intermediaire' },
            { label: 'Avancé', value: 'avance' }
          ]}
        />
        <Input label="Séances par semaine" name="sessionsPerWeek" type="number" defaultValue={profile.sessionsPerWeek} min={1} max={7} required />
        <Input label="Durée par séance" name="durationMinutes" type="number" defaultValue={profile.durationMinutes} min={10} max={180} required />
        <Textarea label="Matériel disponible" name="equipment" defaultValue={profile.equipment.join(', ')} rows={3} />
        <Textarea label="Limitations physiques" name="physicalLimitations" defaultValue={profile.physicalLimitations.join(', ')} rows={3} />
        <Textarea label="Préférences sportives" name="sportPreferences" defaultValue={profile.sportPreferences.join(', ')} rows={3} />
        <div className="form-actions span-two">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </Button>
        </div>
        {isSaved ? <div className="span-two"><Alert tone="success" title="Profil mis à jour">Le profil local est conservé dans le navigateur et réutilisé par les endpoints IA.</Alert></div> : null}
      </form>
    </Card>
  );
}
