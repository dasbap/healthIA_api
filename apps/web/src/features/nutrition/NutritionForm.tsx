import { FormEvent, useState } from 'react';
import type { NutritionRecommendationRequest } from '../../api/aiApi';
import type { UserProfile } from '../../api/usersApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

type NutritionFormProps = {
  profile: UserProfile;
  onSubmit: (payload: NutritionRecommendationRequest) => void;
  isLoading: boolean;
};

type NutritionFormErrors = Partial<Record<keyof NutritionRecommendationRequest, string>>;

function validatePayload(payload: NutritionRecommendationRequest) {
  const errors: NutritionFormErrors = {};

  if (!payload.goal.trim()) {
    errors.goal = 'Choisissez un objectif nutritionnel.';
  }

  if (!Number.isFinite(payload.targetCalories) || payload.targetCalories < 300 || payload.targetCalories > 4000) {
    errors.targetCalories = 'Indiquez une valeur entre 300 et 4000 kcal.';
  }

  if (!Number.isFinite(payload.budget) || payload.budget < 10) {
    errors.budget = 'Indiquez un budget hebdomadaire d’au moins 10 euros.';
  }

  if (!payload.diet.trim()) {
    errors.diet = 'Choisissez un régime alimentaire.';
  }

  return errors;
}

export function NutritionForm({ profile, onSubmit, isLoading }: NutritionFormProps) {
  const [errors, setErrors] = useState<NutritionFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      userId: profile.userId,
      goal: String(form.get('goal')),
      targetCalories: Number(form.get('targetCalories')),
      budget: Number(form.get('budget')),
      allergies: String(form.get('allergies')),
      diet: String(form.get('diet')),
      dietaryRestrictions: String(form.get('dietaryRestrictions')),
      preferences: String(form.get('preferences')),
      activityLevel: String(form.get('activityLevel'))
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
          <h2>Objectif nutritionnel</h2>
          <p>Champs transmis au endpoint nutrition pour générer une recommandation traçable.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 ? (
          <div className="span-two" aria-live="assertive">
            <Alert tone="warning" title="Formulaire à compléter">
              Corrigez les champs signalés avant de générer une recommandation.
            </Alert>
          </div>
        ) : null}
        <Select
          label="Objectif"
          name="goal"
          defaultValue={profile.goal}
          required
          error={errors.goal}
          hint="Permet d’adapter les portions, le niveau calorique et les conseils."
          options={[
            { label: 'Perte de graisse', value: 'perte de graisse' },
            { label: 'Maintien du poids', value: 'maintien' },
            { label: 'Prise de masse maigre', value: 'prise de masse' },
            { label: 'Equilibre general', value: 'equilibre' }
          ]}
        />
        <Input
          label="Calories cibles"
          name="targetCalories"
          type="number"
          defaultValue={profile.targetCalories}
          min={300}
          max={4000}
          required
          hint="Valeur indicative pour un repas ou une journée selon le scénario présenté."
          error={errors.targetCalories}
        />
        <Input
          label="Budget hebdomadaire"
          name="budget"
          type="number"
          defaultValue={profile.budgetPerWeek}
          min={10}
          required
          hint="Utilisé pour vérifier si la proposition reste réaliste."
          error={errors.budget}
        />
        <Input label="Allergies" name="allergies" defaultValue={profile.allergies.join(', ')} hint="Séparez plusieurs allergies par des virgules." />
        <Select
          label="Régime alimentaire"
          name="diet"
          defaultValue={profile.diet}
          required
          error={errors.diet}
          options={[
            { label: 'Omnivore', value: 'omnivore' },
            { label: 'Végétarien', value: 'vegetarien' },
            { label: 'Flexitarien', value: 'flexitarien' },
            { label: 'Sans lactose', value: 'sans lactose' }
          ]}
        />
        <Select
          label="Niveau d’activité"
          name="activityLevel"
          defaultValue={profile.activityLevel}
          hint="Aide l’API IA à ajuster les portions et les conseils."
          options={[
            { label: 'Faible', value: 'faible' },
            { label: 'Modérée', value: 'moderee' },
            { label: 'Élevée', value: 'elevee' }
          ]}
        />
        <Textarea
          label="Restrictions alimentaires"
          name="dietaryRestrictions"
          defaultValue={profile.dietaryRestrictions.join(', ')}
          rows={3}
          hint="Conservé dans le payload et visible côté audit même si le moteur nutrition exploite surtout régime/allergies."
        />
        <Textarea
          label="Préférences alimentaires"
          name="preferences"
          defaultValue={profile.foodPreferences.join(', ')}
          rows={4}
          hint="Exemples : temps de préparation, aliments appréciés, organisation des repas."
        />
        <div className="form-actions span-two">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Génération...' : 'Générer la recommandation'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
