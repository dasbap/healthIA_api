import type { SportRecommendation } from '../../api/aiApi';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { ExerciseList } from './ExerciseList';

export function WorkoutResult({ recommendation }: { recommendation: SportRecommendation }) {
  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <div>
            <h2>{recommendation.title}</h2>
            <p>{recommendation.explanation}</p>
          </div>
          <Badge tone="info">{Math.round(recommendation.score * 100)}% compatible</Badge>
        </CardHeader>
        <div className="metric-row">
          <span><strong>{recommendation.duration} min</strong>Duree</span>
          <span><strong>{recommendation.intensity}</strong>Intensite</span>
          <span><strong>{recommendation.model}</strong>Modele</span>
        </div>
        {recommendation.warning ? (
          <Alert tone="warning" title="Precaution">
            {recommendation.warning}
          </Alert>
        ) : null}
      </Card>
      <ExerciseList exercises={recommendation.exercises} />
    </div>
  );
}
