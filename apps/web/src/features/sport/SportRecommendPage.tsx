import { useState } from 'react';
import { generateSportRecommendation, type SportRecommendation, type SportRecommendationRequest } from '../../api/aiApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Alert } from '../../components/ui/Alert';
import { SportForm } from './SportForm';
import { WorkoutResult } from './WorkoutResult';

export function SportRecommendPage() {
  const [recommendation, setRecommendation] = useState<SportRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload: SportRecommendationRequest) {
    setIsLoading(true);
    setError('');
    try {
      setRecommendation(await generateSportRecommendation(payload));
    } catch {
      setError('La génération sportive démo a échoué.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Sport IA</p>
          <h1>Programme sportif</h1>
          <p>Programme démo adapté au niveau et aux limitations.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Génération impossible">{error}</Alert> : null}
      <SportForm onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur sport démo construit la séance..." /> : null}
      {recommendation ? <WorkoutResult recommendation={recommendation} /> : null}
    </div>
  );
}
