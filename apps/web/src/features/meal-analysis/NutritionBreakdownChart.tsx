import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { NutritionMacros } from '../../api/aiApi';
import { Card, CardHeader } from '../../components/ui/Card';

const colors = ['#15a082', '#3b82f6', '#f59e0b'];

export function NutritionBreakdownChart({ nutrition }: { nutrition: NutritionMacros }) {
  const chartData = useMemo(() => [
    { name: 'Protéines', value: nutrition.protein },
    { name: 'Glucides', value: nutrition.carbs },
    { name: 'Lipides', value: nutrition.fat }
  ], [nutrition.carbs, nutrition.fat, nutrition.protein]);

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Estimation nutritionnelle</h2>
          <p>{nutrition.calories} kcal estimées pour l’assiette.</p>
        </div>
      </CardHeader>
      <div className="macro-summary">
        <strong>{nutrition.protein}g protéines</strong>
        <strong>{nutrition.carbs}g glucides</strong>
        <strong>{nutrition.fat}g lipides</strong>
      </div>
      <div className="chart-box small" aria-label="Graphique de répartition des macronutriments">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
