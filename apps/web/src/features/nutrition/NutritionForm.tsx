import { FormEvent, useState } from 'react';
import type { NutritionRecommendationRequest } from '../../api/aiApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

type NutritionFormProps = {
  onSubmit: (payload: NutritionRecommendationRequest) => void;
  isLoading: boolean;
};

type NutritionFormErrors = Partial<Record<keyof NutritionRecommendationRequest, string>>;

function validatePayload(payload: NutritionRecommendationRequest) {
  const errors: NutritionFormErrors = {};

  if (!payload.goal.trim()) {
    errors.goal = 'Choisissez un objectif nutritionnel.';
  }

  if (!Number.isFinite(payload.targetCalories) || payload.targetCalories < 300 || payload.targetCalories > 2000) {
    errors.targetCalories = 'Indiquez une valeur entre 300 et 2000 kcal.';
  }

  if (!Number.isFinite(payload.budget) || payload.budget < 10) {
    errors.budget = 'Indiquez un budget hebdomadaire d’au moins 10 euros.';
  }

  if (!payload.diet.trim()) {
    errors.diet = 'Choisissez un régime alimentaire.';
  }

  return errors;
}

export function NutritionForm({ onSubmit, isLoading }: NutritionFormProps) {
  const [errors, setErrors] = useState<NutritionFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      goal: String(form.get('goal')),
      targetCalories: Number(form.get('targetCalories')),
      budget: Number(form.get('budget')),
      allergies: String(form.get('allergies')),
      diet: String(form.get('diet')),
      preferences: String(form.get('preferences'))
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
          <p>Contraintes utilisateur pour simuler une recommandation personnalisée et expliquer les choix proposés.</p>
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
          defaultValue="perte de graisse"
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
          defaultValue={560}
          min={300}
          max={2000}
          required
          hint="Valeur indicative pour un repas ou une journée selon le scénario présenté."
          error={errors.targetCalories}
        />
        <Input
          label="Budget hebdomadaire"
          name="budget"
          type="number"
          defaultValue={65}
          min={10}
          required
          hint="Utilisé pour vérifier si la proposition reste réaliste."
          error={errors.budget}
        />
        <Input label="Allergies" name="allergies" defaultValue="Noisettes" hint="Séparez plusieurs allergies par des virgules." />
        <Select
          label="Régime alimentaire"
          name="diet"
          defaultValue="omnivore"
          required
          error={errors.diet}
          options={[
            { label: 'Omnivore', value: 'omnivore' },
            { label: 'Végétarien', value: 'vegetarien' },
            { label: 'Flexitarien', value: 'flexitarien' },
            { label: 'Sans lactose', value: 'sans lactose' }
          ]}
        />
        <Textarea
          label="Préférences alimentaires"
          name="preferences"
          defaultValue="Repas rapides, légumes verts, poulet"
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
