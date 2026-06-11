import { useState } from 'react';
import { queryClient } from '../../app/queryClient';
import { generateSportRecommendation, type SportRecommendation, type SportRecommendationRequest } from '../../api/aiApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Alert } from '../../components/ui/Alert';
import { useUserProfile } from '../../hooks/useUserProfile';
import { SportForm } from './SportForm';
import { WorkoutResult } from './WorkoutResult';

export function SportRecommendPage() {
  const { profile } = useUserProfile();
  const [recommendation, setRecommendation] = useState<SportRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload: SportRecommendationRequest) {
    setIsLoading(true);
    setError('');
    try {
      const response = await generateSportRecommendation(payload);
      setRecommendation(response);
      queryClient.invalidateQueries({ queryKey: ['recommendations', profile.userId] });
    } catch {
      setError('La génération sportive est indisponible. Vérifiez l’API IA puis réessayez.');
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
          <p>Programme généré via `/ai/sport/recommend` avec le profil courant : {profile.userId}.</p>
        </div>
      </section>
      {error ? <Alert tone="danger" title="Génération impossible">{error}</Alert> : null}
      <SportForm profile={profile} onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading ? <LoadingState label="Le moteur sport IA construit la séance..." /> : null}
      {recommendation ? <WorkoutResult recommendation={recommendation} /> : null}
    </div>
  );
}
