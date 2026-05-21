import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

type AlertProps = {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: AlertCircle
};

export function Alert({ tone = 'info', title, children }: AlertProps) {
  const Icon = icons[tone];
  return (
    <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
