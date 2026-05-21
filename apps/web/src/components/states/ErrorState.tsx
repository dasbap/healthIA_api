import { Alert } from '../ui/Alert';

export function ErrorState({ title = 'Une erreur est survenue', message }: { title?: string; message: string }) {
  return (
    <Alert tone="danger" title={title}>
      {message}
    </Alert>
  );
}
