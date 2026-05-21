import { useState } from 'react';
import { generateNutritionRecommendation, type NutritionRecommendation, type NutritionRecommendationRequest } from '../../api/aiApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Alert } from '../../components/ui/Alert';
import { ImbalancePanel } from './ImbalancePanel';
import { MealPlanResult } from './MealPlanResult';
import { NutritionForm } from './NutritionForm';

export function NutritionRecommendPage() {
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload: NutritionRecommendationRequest) {
    setIsLoading(true);
    setError('');
    try {
      setRecommendation(await generateNutritionRecommendation(payload));
    } catch {
      setError('La generation nutritionnelle demo a echoue.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Nutrition IA</p>
          <h2>Recommandation nutritionnelle personnalisee</h2>
          <p>Formulaire multi-criteres et resultat IA fictif prepare pour les futurs endpoints.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Generation impossible">{error}</Alert> : null}
      <NutritionForm onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur nutrition demo compose le plan..." /> : null}
      {recommendation ? (
        <>
          <MealPlanResult recommendation={recommendation} />
          <ImbalancePanel
            imbalances={['Objectif calorique controle', 'Proteines prioritaires', 'Budget surveille']}
            suggestions={recommendation.advice}
          />
        </>
      ) : null}
    </div>
  );
}
