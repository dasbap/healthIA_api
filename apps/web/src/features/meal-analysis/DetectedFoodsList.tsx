import type { DetectedFood } from '../../api/aiApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';

export function DetectedFoodsList({ foods }: { foods: DetectedFood[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Aliments detectes</h2>
          <p>Confiance estimee par le modele vision demo.</p>
        </div>
      </CardHeader>
      <div className="list-stack">
        {foods.map((food) => (
          <div className="food-row" key={food.label}>
            <span>{food.label}</span>
            <Badge tone={food.confidence > 0.75 ? 'success' : 'warning'}>{Math.round(food.confidence * 100)}%</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
