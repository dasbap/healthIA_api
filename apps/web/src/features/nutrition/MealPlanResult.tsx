import type { NutritionRecommendation } from '../../api/aiApi';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { NutritionBreakdownChart } from '../meal-analysis/NutritionBreakdownChart';

function scoreLabel(scorePercent: number) {
  if (scorePercent >= 80) {
    return 'Très adapté';
  }
  if (scorePercent >= 60) {
    return 'Adaptation moyenne';
  }
  return 'À vérifier';
}

export function MealPlanResult({ recommendation }: { recommendation: NutritionRecommendation }) {
  const scorePercent = Math.round(recommendation.score * 100);
  const isFallback = recommendation.fallbackUsed ?? false;
  const isFrontendMock = recommendation.model.includes('demo') && !recommendation.model.includes('fallback');
  const isHealthAiEngine = recommendation.model === 'healthai-nutrition-recommender-v1' && !isFallback;

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
            ? 'L’API a répondu avec le moteur déterministe backend, sans prétendre utiliser un modèle nutrition entraîné.'
            : isHealthAiEngine
              ? 'Moteur nutrition HealthAI : logique règles/scoring extraite des notebooks, sans chargement de modèle ML absent.'
              : 'La page a reçu une réponse du endpoint /ai/nutrition/recommend.'}
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
          Score de pertinence : {scorePercent} / 100. Niveau : {scoreLabel(scorePercent)}. Il synthétise l’objectif,
          les calories, le budget, le régime et les contraintes saisies. Modèle utilisé : {recommendation.model}.
        </p>
        <div className="result-grid">
          <div>
            <h3>Repas recommandé</h3>
            <ul className="check-list">
              {recommendation.mealPlan.map((meal) => (
                <li key={meal}>{meal}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Contraintes respectées</h3>
            <div className="badge-row">
              <Badge tone={recommendation.constraintsChecked.allergies ? 'success' : 'danger'}>
                Allergies {recommendation.constraintsChecked.allergies ? 'OK' : 'à vérifier'}
              </Badge>
              <Badge tone={recommendation.constraintsChecked.diet ? 'success' : 'danger'}>
                Régime {recommendation.constraintsChecked.diet ? 'OK' : 'à vérifier'}
              </Badge>
              <Badge tone={recommendation.constraintsChecked.budget ? 'success' : 'warning'}>
                Budget {recommendation.constraintsChecked.budget ? 'OK' : 'à surveiller'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
      <NutritionBreakdownChart nutrition={recommendation.macros} />
    </div>
  );
}
