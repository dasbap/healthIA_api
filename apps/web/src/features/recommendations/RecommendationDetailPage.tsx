import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getRecommendationDetail } from '../../api/recommendationsApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { routes } from '../../config/routes';
import { FeedbackForm } from './FeedbackForm';

export function RecommendationDetailPage() {
  const { id = 'rec_001' } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['recommendation-detail', id],
    queryFn: () => getRecommendationDetail(id)
  });

  if (isLoading || !data) {
    return <LoadingState label="Chargement du detail IA..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Detail recommandation</p>
          <h2>{data.title}</h2>
          <p>Trace explicable de l’entrée utilisateur, du resultat IA et du modele fictif.</p>
        </div>
        <Link className="text-link" to={routes.recommendations}>
          Retour historique
        </Link>
      </section>

      <Card>
        <CardHeader>
          <div>
            <h2>Resultat IA</h2>
            <p>{data.summary}</p>
          </div>
          <Badge tone="info">{Math.round(data.score * 100)}%</Badge>
        </CardHeader>
        <div className="detail-grid">
          <div>
            <h3>Input utilisateur</h3>
            <p>{data.userInput}</p>
          </div>
          <div>
            <h3>Sortie IA</h3>
            <p>{data.aiResult}</p>
          </div>
          <div>
            <h3>Explication</h3>
            <p>{data.explanation}</p>
          </div>
          <div>
            <h3>Modele</h3>
            <p>{data.model} v{data.modelVersion}</p>
            <p>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.createdAt))}</p>
          </div>
        </div>
        <div className="badge-row">
          {data.signals.map((signal) => (
            <Badge key={signal} tone="neutral">{signal}</Badge>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2>Feedback utilisateur</h2>
            <p>Evaluation locale pour simuler l’amelioration continue.</p>
          </div>
        </CardHeader>
        <FeedbackForm recommendationId={data.id} />
      </Card>
    </div>
  );
}
