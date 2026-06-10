import { useState } from 'react';
import { analyzeMeal, type MealAnalysisRequest, type MealAnalysisResponse } from '../../api/aiApi';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/states/LoadingState';
import { DetectedFoodsList } from './DetectedFoodsList';
import { MealUploadForm } from './MealUploadForm';
import { NutritionBreakdownChart } from './NutritionBreakdownChart';
import { ImbalancePanel } from '../nutrition/ImbalancePanel';

export function MealAnalysisPage() {
  const [result, setResult] = useState<MealAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalysis(payload: MealAnalysisRequest) {
    setIsLoading(true);
    setError('');
    try {
      const response = await analyzeMeal(payload);
      setResult(response);
    } catch {
      setError('Impossible de lancer l’analyse demo du repas.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Analyse repas</p>
          <h1>Détection d’aliments et estimation nutritionnelle</h1>
          <p>Simulation complète de la future analyse photo/URL avec résultats clairement identifiés comme démo.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Analyse indisponible">{error}</Alert> : null}
      <MealUploadForm onSubmit={handleAnalysis} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le modèle vision démo analyse l’image..." /> : null}
      {result ? (
        <div className="dashboard-grid">
          <div className="span-two">
            <Alert tone={result.fallbackUsed ? 'warning' : 'success'} title={result.fallbackUsed ? 'Analyse estimée' : 'Analyse vision réelle'}>
              {result.fallbackUsed
                ? 'Analyse estimée : le modèle vision local n’est pas disponible, le résultat est généré par un fallback backend.'
                : 'Analyse vision réalisée à partir de l’image envoyée.'}
              {' '}Modèle utilisé : {result.model}. {result.explanation}
            </Alert>
          </div>
          <DetectedFoodsList foods={result.detectedFoods} />
          <NutritionBreakdownChart nutrition={result.nutrition} />
          <div className="span-two">
            <ImbalancePanel imbalances={result.imbalances} suggestions={result.suggestions} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
