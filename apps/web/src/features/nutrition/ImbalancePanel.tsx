import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';

type ImbalancePanelProps = {
  imbalances: string[];
  suggestions?: string[];
};

export function ImbalancePanel({ imbalances, suggestions = [] }: ImbalancePanelProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Déséquilibres et pistes</h2>
          <p>Lecture des signaux nutritionnels principaux.</p>
        </div>
      </CardHeader>
      <div className="two-column-list">
        <div>
          <h3><AlertTriangle size={17} aria-hidden="true" /> Points détectés</h3>
          <ul className="check-list warning-list">
            {imbalances.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3><Lightbulb size={17} aria-hidden="true" /> Suggestions</h3>
          <ul className="check-list">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
