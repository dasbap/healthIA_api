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
      setError('La generation sportive demo a echoue.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Sport IA</p>
          <h2>Recommandation sportive multi-criteres</h2>
          <p>Programme fictif adapte a l’objectif, au niveau, au temps disponible et aux limitations.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Generation impossible">{error}</Alert> : null}
      <SportForm onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur sport demo construit la seance..." /> : null}
      {recommendation ? <WorkoutResult recommendation={recommendation} /> : null}
    </div>
  );
}
