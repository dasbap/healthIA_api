import { Menu } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { AccessibilityPanel } from '../accessibility/AccessibilityPanel';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type TopbarProps = {
  onMenuClick: () => void;
  apiStatusLabel: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ onMenuClick, apiStatusLabel }: TopbarProps) {
  const { profile } = useUserProfile();

  return (
    <header className="topbar">
      <Button variant="ghost" className="mobile-menu-button" onClick={onMenuClick} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </Button>
      <div className="topbar-title">
        <p className="eyebrow">HealthAI Coach IA</p>
        <p>Interface nutrition, sport et suivi utilisateur</p>
      </div>
      <AccessibilityPanel />
      <Badge tone={apiStatusLabel.includes('indisponible') ? 'warning' : 'info'}>{apiStatusLabel}</Badge>
      <div className="user-chip" aria-label={`Utilisateur connecté ${profile.name}`}>
        <span>{profile.name}</span>
        <strong>{getInitials(profile.name)}</strong>
      </div>
    </header>
  );
}
