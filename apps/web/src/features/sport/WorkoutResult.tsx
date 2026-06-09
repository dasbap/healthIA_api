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

export function WorkoutResult({ recommendation }: { recommendation: SportRecommendation }) {
  const scorePercent = Math.round(recommendation.score * 100);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <div>
            <h2>{recommendation.title}</h2>
            <p>{recommendation.explanation}</p>
          </div>
          <Badge tone={scorePercent >= 80 ? 'success' : 'warning'}>{scorePercent}% compatible</Badge>
        </CardHeader>
        <p className="score-explanation">
          Score de compatibilité : il combine objectif, niveau, durée, fatigue, matériel et limitations déclarées.
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
