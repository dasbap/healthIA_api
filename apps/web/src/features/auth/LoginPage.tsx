import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { routes } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@healthai.local');
  const [password, setPassword] = useState('Demo123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(routes.dashboard);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Connexion impossible');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <Card className="login-card">
        <p className="eyebrow">HealthAI Coach IA</p>
        <h1>Connexion démo</h1>
        <p className="muted">
          Utilisez le compte fictif fourni pour presenter l’interface sans backend.
        </p>
        {error ? <Alert tone="danger" title="Connexion refusee">{error}</Alert> : null}
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Mot de passe" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        <p className="field-hint">Compte: demo@healthai.local / Demo123!</p>
      </Card>
    </main>
  );
}
