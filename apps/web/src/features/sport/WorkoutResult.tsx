import type { SportRecommendation } from '../../api/aiApi';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { ExerciseList } from './ExerciseList';

const intensityLabels = {
  low: 'Faible',
  medium: 'Modérée',
  high: 'Élevée'
};

function scoreLabel(scorePercent: number) {
  if (scorePercent >= 80) {
    return 'Très adapté';
  }
  if (scorePercent >= 60) {
    return 'Adaptation moyenne';
  }
  return 'À vérifier';
}

export function WorkoutResult({ recommendation }: { recommendation: SportRecommendation }) {
  const scorePercent = Math.round(recommendation.score * 100);
  const isFallback = recommendation.fallbackUsed ?? false;
  const isFrontendMock = recommendation.model.includes('demo') && !recommendation.model.includes('fallback');
  const isHealthAiEngine = recommendation.model === 'healthai-sport-recommender-v1' && !isFallback;

  return (
    <div className="page-stack">
      <Alert
        tone={isFrontendMock ? 'warning' : isFallback ? 'info' : 'success'}
        title={
          isFrontendMock
            ? 'API IA indisponible — mock frontend'
            : isFallback
              ? 'API IA active — moteur backend de démonstration'
              : 'Recommandation générée par l’API IA'
        }
      >
        {isFrontendMock
          ? 'L’appel réseau a échoué ou les mocks frontend sont forcés.'
          : isFallback
            ? 'L’API a répondu avec le moteur déterministe backend, sans prétendre utiliser un modèle sport entraîné.'
            : isHealthAiEngine
              ? 'Moteur sport HealthAI : logique règles/scoring extraite des notebooks, sans chargement de modèle ML absent.'
              : 'La page a reçu une réponse du endpoint /ai/sport/recommend.'}
      </Alert>
      <Card>
        <CardHeader>
          <div>
            <h2>{recommendation.title}</h2>
            <p>{recommendation.explanation}</p>
          </div>
          <Badge tone={scorePercent >= 80 ? 'success' : 'warning'}>
            Score de pertinence : {scorePercent} / 100, {scoreLabel(scorePercent)}
          </Badge>
        </CardHeader>
        <p className="score-explanation">
          Score de pertinence : {scorePercent} / 100. Niveau : {scoreLabel(scorePercent)}. Il combine objectif,
          niveau, durée, fatigue, matériel et limitations déclarées.
        </p>
        <div className="metric-row">
          <span><strong>{recommendation.duration} min</strong>Durée</span>
          <span><strong>{intensityLabels[recommendation.intensity]}</strong>Intensité</span>
          <span><strong>{recommendation.model}</strong>Modèle</span>
        </div>
        {recommendation.warning ? (
          <Alert tone="warning" title="Précaution">
            {recommendation.warning}
          </Alert>
        ) : null}
      </Card>
      <ExerciseList exercises={recommendation.exercises} />
    </div>
  );
}
