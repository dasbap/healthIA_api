import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../api/usersApi';
import { LoadingState } from '../../components/states/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { PreferencesForm } from './PreferencesForm';

export function ProfilePage() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getUserProfile });

  if (isLoading || !profile) {
    return <LoadingState label="Chargement du profil demo..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Profil</p>
          <h2>{profile.name}</h2>
          <p>Preferences nutritionnelles et sportives utilisees pour personnaliser les futures recommandations.</p>
        </div>
      </section>
      <Card>
        <CardHeader>
          <div>
            <h2>Synthese</h2>
            <p>{profile.email}</p>
          </div>
          <Badge tone="info">Utilisateur demo</Badge>
        </CardHeader>
        <div className="metric-row">
          <span><strong>{profile.age}</strong>ans</span>
          <span><strong>{profile.heightCm}</strong>cm</span>
          <span><strong>{profile.weightKg}</strong>kg</span>
          <span><strong>{profile.budgetPerWeek}€</strong>budget/semaine</span>
        </div>
      </Card>
      <PreferencesForm profile={profile} />
    </div>
  );
}
