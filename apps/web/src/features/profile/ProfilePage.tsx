import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { useUserProfile } from '../../hooks/useUserProfile';
import { PreferencesForm } from './PreferencesForm';

export function ProfilePage() {
  const { profile, saveProfile } = useUserProfile();

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Profil</p>
          <h1>{profile.name}</h1>
          <p>Source locale du userId utilisé par les recommandations, l’analyse repas, l’historique et le feedback.</p>
        </div>
      </section>
      <Card>
        <CardHeader>
          <div>
            <h2>Synthèse</h2>
            <p>{profile.email}</p>
          </div>
          <Badge tone="info">UserId : {profile.userId}</Badge>
        </CardHeader>
        <div className="metric-row">
          <span><strong>{profile.age}</strong>ans</span>
          <span><strong>{profile.heightCm}</strong>cm</span>
          <span><strong>{profile.weightKg}</strong>kg</span>
          <span><strong>{profile.sessionsPerWeek}</strong>séances/semaine</span>
          <span><strong>{profile.budgetPerWeek}€</strong>budget/semaine</span>
        </div>
      </Card>
      <PreferencesForm profile={profile} onSave={saveProfile} />
    </div>
  );
}
