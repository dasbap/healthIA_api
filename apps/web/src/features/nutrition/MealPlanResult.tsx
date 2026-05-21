import type { NutritionRecommendation } from '../../api/aiApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { NutritionBreakdownChart } from '../meal-analysis/NutritionBreakdownChart';

export function MealPlanResult({ recommendation }: { recommendation: NutritionRecommendation }) {
  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <div>
            <h2>{recommendation.title}</h2>
            <p>{recommendation.explanation}</p>
          </div>
          <Badge tone="success">{Math.round(recommendation.score * 100)}% compatible</Badge>
        </CardHeader>
        <div className="result-grid">
          <div>
            <h3>Repas recommande</h3>
            <ul className="check-list">
              {recommendation.mealPlan.map((meal) => (
                <li key={meal}>{meal}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Contraintes respectees</h3>
            <div className="badge-row">
              <Badge tone={recommendation.constraintsChecked.allergies ? 'success' : 'danger'}>Allergies</Badge>
              <Badge tone={recommendation.constraintsChecked.diet ? 'success' : 'danger'}>Regime</Badge>
              <Badge tone={recommendation.constraintsChecked.budget ? 'success' : 'warning'}>Budget</Badge>
            </div>
          </div>
        </div>
      </Card>
      <NutritionBreakdownChart nutrition={recommendation.macros} />
    </div>
  );
}
