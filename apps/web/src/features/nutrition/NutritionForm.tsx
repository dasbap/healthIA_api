import { FormEvent } from 'react';
import type { NutritionRecommendationRequest } from '../../api/aiApi';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

type NutritionFormProps = {
  onSubmit: (payload: NutritionRecommendationRequest) => void;
  isLoading: boolean;
};

export function NutritionForm({ onSubmit, isLoading }: NutritionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      goal: String(form.get('goal')),
      targetCalories: Number(form.get('targetCalories')),
      budget: Number(form.get('budget')),
      allergies: String(form.get('allergies')),
      diet: String(form.get('diet')),
      preferences: String(form.get('preferences'))
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Objectif nutritionnel</h2>
          <p>Contraintes utilisateur pour simuler une recommandation personnalisee.</p>
        </div>
      </CardHeader>
      <form className="form-grid two-cols" onSubmit={handleSubmit}>
        <Select
          label="Objectif"
          name="goal"
          defaultValue="perte de graisse"
          options={[
            { label: 'Perte de graisse', value: 'perte de graisse' },
            { label: 'Maintien du poids', value: 'maintien' },
            { label: 'Prise de masse maigre', value: 'prise de masse' },
            { label: 'Equilibre general', value: 'equilibre' }
          ]}
        />
        <Input label="Calories cibles" name="targetCalories" type="number" defaultValue={560} min={300} />
        <Input label="Budget hebdomadaire" name="budget" type="number" defaultValue={65} min={10} />
        <Input label="Allergies" name="allergies" defaultValue="Noisettes" />
        <Select
          label="Regime alimentaire"
          name="diet"
          defaultValue="omnivore"
          options={[
            { label: 'Omnivore', value: 'omnivore' },
            { label: 'Vegetarien', value: 'vegetarien' },
            { label: 'Flexitarien', value: 'flexitarien' },
            { label: 'Sans lactose', value: 'sans lactose' }
          ]}
        />
        <Input label="Preferences alimentaires" name="preferences" defaultValue="Repas rapides, legumes verts, poulet" />
        <div className="form-actions">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generation...' : 'Generer la recommandation'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
