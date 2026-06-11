import { useState } from 'react';
import { queryClient } from '../../app/queryClient';
import { generateNutritionRecommendation, type NutritionRecommendation, type NutritionRecommendationRequest } from '../../api/aiApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Alert } from '../../components/ui/Alert';
import { useUserProfile } from '../../hooks/useUserProfile';
import { ImbalancePanel } from './ImbalancePanel';
import { MealPlanResult } from './MealPlanResult';
import { NutritionForm } from './NutritionForm';

export function NutritionRecommendPage() {
  const { profile } = useUserProfile();
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload: NutritionRecommendationRequest) {
    setIsLoading(true);
    setError('');
    try {
      const response = await generateNutritionRecommendation(payload);
      setRecommendation(response);
      queryClient.invalidateQueries({ queryKey: ['recommendations', profile.userId] });
    } catch {
      setError('La génération nutritionnelle est indisponible. Vérifiez l’API IA puis réessayez.');
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
          <p>Formulaire connecté au endpoint `/ai/nutrition/recommend` avec le profil courant : {profile.userId}.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Génération impossible">{error}</Alert> : null}
      <NutritionForm profile={profile} onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur nutrition IA compose le plan..." /> : null}
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
