import { Menu } from 'lucide-react';
import { getCurrentUser } from '../../api/authApi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const user = getCurrentUser();

  return (
    <header className="topbar">
      <Button variant="ghost" className="mobile-menu-button" onClick={onMenuClick} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </Button>
      <div className="topbar-title">
        <p className="eyebrow">HealthAI Coach IA</p>
        <p>Interface nutrition, sport et suivi utilisateur</p>
      </div>
      <Badge tone="info">Mode démo</Badge>
      <div className="user-chip" aria-label={`Utilisateur connecté ${user.name}`}>
        <span>{user.name}</span>
        <strong>{user.name.slice(0, 2).toUpperCase()}</strong>
      </div>
    </header>
  );
}
