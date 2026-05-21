import type { ReactNode } from 'react';
import { Card } from '../../components/ui/Card';

type KpiCardProps = {
  title: string;
  value: string;
  trend: string;
  icon: ReactNode;
};

export function KpiCard({ title, value, trend, icon }: KpiCardProps) {
  return (
    <Card className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{trend}</span>
      </div>
    </Card>
  );
}
