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
      setError('La génération nutritionnelle démo a échoué.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Nutrition IA</p>
          <h1>Plan nutrition personnalisé</h1>
          <p>Formulaire ciblé et résultat démo préparé pour le futur endpoint `/ai/nutrition/recommend`.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Génération impossible">{error}</Alert> : null}
      <NutritionForm onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur nutrition démo compose le plan..." /> : null}
      {recommendation ? (
        <>
          <MealPlanResult recommendation={recommendation} />
          <ImbalancePanel
            imbalances={['Objectif calorique contrôlé', 'Protéines prioritaires', 'Budget surveillé']}
            suggestions={recommendation.advice}
          />
        </>
      ) : null}
    </div>
  );
}
