import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getRecommendationHistory, type RecommendationType } from '../../api/recommendationsApi';
import { EmptyState } from '../../components/states/EmptyState';
import { LoadingState } from '../../components/states/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { routes } from '../../config/routes';
import { useUserProfile } from '../../hooks/useUserProfile';

const typeLabels = {
  all: 'Tous',
  nutrition: 'Nutrition',
  sport: 'Sport',
  'meal-analysis': 'Analyse repas'
};

export function RecommendationHistoryPage() {
  const { profile } = useUserProfile();
  const { data = [], isLoading } = useQuery({
    queryKey: ['recommendations', profile.userId],
    queryFn: () => getRecommendationHistory(profile.userId)
  });
  const [filter, setFilter] = useState<RecommendationType | 'all'>('all');

  const filtered = useMemo(() => {
    return filter === 'all' ? data : data.filter((item) => item.type === filter);
  }, [data, filter]);

  if (isLoading) {
    return <LoadingState label="Chargement de l’historique IA..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Historique</p>
          <h1>Recommandations et analyses IA</h1>
          <p>Résultats enregistrés pour le profil courant : {profile.userId}.</p>
        </div>
      </section>
      <Card>
        <CardHeader>
          <div>
            <h2>Filtres</h2>
            <p>Affiner par type de recommandation.</p>
          </div>
        </CardHeader>
        <Select
          label="Type"
          value={filter}
          onChange={(event) => setFilter(event.target.value as RecommendationType | 'all')}
          options={[
            { label: 'Tous', value: 'all' },
            { label: 'Nutrition', value: 'nutrition' },
            { label: 'Sport', value: 'sport' },
            { label: 'Analyse repas', value: 'meal-analysis' }
          ]}
        />
      </Card>
      <Card>
        <CardHeader>
          <div>
            <h2>Résultats</h2>
            <p>{filtered.length} élément(s) affiché(s).</p>
          </div>
        </CardHeader>
        {filtered.length === 0 ? (
          <EmptyState title="Aucun résultat" message="Aucune recommandation API ne correspond à ce profil et à ce filtre." />
        ) : (
          <div className="history-list">
            {filtered.map((item) => (
              <article className="history-row" key={item.id}>
                <div>
                  <Badge tone={item.type === 'nutrition' ? 'success' : item.type === 'sport' ? 'info' : 'warning'}>
                    {typeLabels[item.type]}
                  </Badge>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <div className="history-meta">
                  <span>{new Intl.DateTimeFormat('fr-FR').format(new Date(item.createdAt))}</span>
                  <span>{Math.round(item.score * 100)}%</span>
                  <Badge tone={item.status === 'flagged' ? 'warning' : 'neutral'}>{item.status}</Badge>
                  <Link className="link-button" to={routes.recommendationDetail(item.id)}>Voir le détail</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
