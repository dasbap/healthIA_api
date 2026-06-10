import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { routes } from '../../config/routes';
import type { RecommendationHistoryItem } from '../../api/recommendationsApi';

type RecommendationOverviewProps = {
  items: RecommendationHistoryItem[];
};

const typeLabels = {
  nutrition: 'Nutrition',
  sport: 'Sport',
  'meal-analysis': 'Analyse repas'
};

export function RecommendationOverview({ items }: RecommendationOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Dernieres recommandations</h2>
          <p>Suivi recent des generations IA et analyses de repas.</p>
        </div>
        <Link className="text-link" to={routes.recommendations}>
          Voir tout
        </Link>
      </CardHeader>
      <div className="list-stack">
        {items.slice(0, 3).map((item) => (
          <Link className="overview-row" to={routes.recommendationDetail(item.id)} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
            <Badge tone={item.type === 'sport' ? 'info' : item.type === 'nutrition' ? 'success' : 'warning'}>
              {typeLabels[item.type]}
            </Badge>
            <span className="score-pill">{Math.round(item.score * 100)}%</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
