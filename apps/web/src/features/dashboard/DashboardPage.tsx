import { useQuery } from '@tanstack/react-query';
import { Activity, BrainCircuit, Dumbbell, Salad } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getRecommendationHistory } from '../../api/recommendationsApi';
import { Alert } from '../../components/ui/Alert';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingState } from '../../components/states/LoadingState';
import { KpiCard } from './KpiCard';
import { RecommendationOverview } from './RecommendationOverview';

const evolutionData = [
  { day: 'Lun', score: 72 },
  { day: 'Mar', score: 76 },
  { day: 'Mer', score: 81 },
  { day: 'Jeu', score: 79 },
  { day: 'Ven', score: 86 },
  { day: 'Sam', score: 84 },
  { day: 'Dim', score: 88 }
];

const repartitionData = [
  { name: 'Nutrition', value: 55, color: '#15a082' },
  { name: 'Sport', value: 30, color: '#3b82f6' },
  { name: 'Analyse repas', value: 15, color: '#f59e0b' }
];

export function DashboardPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['recommendations'], queryFn: getRecommendationHistory });
  const averageScore = data.length ? Math.round((data.reduce((sum, item) => sum + item.score, 0) / data.length) * 100) : 0;
  const mealAnalyses = data.filter((item) => item.type === 'meal-analysis').length;

  if (isLoading) {
    return <LoadingState label="Preparation du dashboard IA..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Dashboard IA</p>
          <h2>Vue globale des recommandations HealthAI</h2>
          <p>Indicateurs demo pour suivre la qualite percue, les analyses et les recommandations personnalisees.</p>
        </div>
      </section>

      <div className="kpi-grid">
        <KpiCard title="Recommandations" value={String(data.length)} trend="+18% cette semaine" icon={<BrainCircuit size={22} />} />
        <KpiCard title="Score moyen" value={`${averageScore}%`} trend="Qualite stable" icon={<Activity size={22} />} />
        <KpiCard title="Analyses repas" value={String(mealAnalyses)} trend="Photos et URLs" icon={<Salad size={22} />} />
        <KpiCard title="Plans sportifs" value={String(data.filter((item) => item.type === 'sport').length)} trend="Bas impact priorise" icon={<Dumbbell size={22} />} />
      </div>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <div>
              <h2>Evolution du score</h2>
              <p>Score moyen fictif des recommandations sur 7 jours.</p>
            </div>
          </CardHeader>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#15a082" fill="#b8f3df" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2>Repartition IA</h2>
              <p>Nutrition, sport et analyse de repas.</p>
            </div>
          </CardHeader>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={repartitionData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={4}>
                  {repartitionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <RecommendationOverview items={data} />
        <Card>
          <CardHeader>
            <div>
              <h2>Alertes nutritionnelles</h2>
              <p>Signaux fictifs detectes sur les derniers repas.</p>
            </div>
          </CardHeader>
          <div className="list-stack">
            <Alert tone="warning" title="Glucides eleves">Deux analyses recentes indiquent une portion de feculents superieure a l’objectif.</Alert>
            <Alert tone="success" title="Proteines correctes">Les apports proteiques restent coherents avec l’objectif principal.</Alert>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>Volume hebdomadaire</h2>
            <p>Nombre fictif de generations IA par categorie.</p>
          </div>
        </CardHeader>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={repartitionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
