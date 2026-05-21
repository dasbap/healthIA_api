import { Menu, Search } from 'lucide-react';
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
      <div>
        <p className="eyebrow">HealthAI Coach IA</p>
        <h1>Interface IA nutrition et sport</h1>
      </div>
      <label className="topbar-search" htmlFor="global-search">
        <Search size={17} aria-hidden="true" />
        <input id="global-search" type="search" placeholder="Rechercher une recommandation" />
      </label>
      <Badge tone="info">Mode demo</Badge>
      <div className="user-chip" aria-label={`Utilisateur connecte ${user.name}`}>
        <span>{user.name}</span>
        <strong>{user.name.slice(0, 2).toUpperCase()}</strong>
      </div>
    </header>
  );
}
