import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Exercise } from '../../api/aiApi';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';

const toneByIntensity = {
  low: 'success',
  medium: 'warning',
  high: 'danger'
} as const;

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Exercices proposes</h2>
          <p>Duree par exercice et intensite prevue.</p>
        </div>
      </CardHeader>
      <div className="list-stack">
        {exercises.map((exercise) => (
          <div className="exercise-row" key={exercise.name}>
            <div>
              <strong>{exercise.name}</strong>
              <p>{exercise.note}</p>
            </div>
            <span>{exercise.duration} min</span>
            <Badge tone={toneByIntensity[exercise.intensity]}>{exercise.intensity}</Badge>
          </div>
        ))}
      </div>
      <div className="chart-box small">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={exercises}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="duration" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
