import type { NutritionRecommendation } from '../../api/aiApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { NutritionBreakdownChart } from '../meal-analysis/NutritionBreakdownChart';

export function MealPlanResult({ recommendation }: { recommendation: NutritionRecommendation }) {
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
          Score de compatibilité : il synthétise l’objectif, les calories, le budget, le régime et les contraintes saisies.
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
