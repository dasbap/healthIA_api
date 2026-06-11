import { FormEvent, useState } from 'react';
import { sendFeedback } from '../../api/recommendationsApi';
import { defaultUserProfile } from '../../api/usersApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

export function FeedbackForm({
  recommendationId,
  userId = defaultUserProfile.userId
}: {
  recommendationId: string;
  userId?: string;
}) {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const comment = String(form.get('comment')).trim();

    if (comment.length < 3) {
      setError('Ajoutez un commentaire court pour expliquer la note.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await sendFeedback(recommendationId, userId, Number(form.get('rating')), comment);
      setIsSent(true);
    } catch {
      setError('Le feedback n’a pas pu être envoyé. En mode démo, il reste simulé localement.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      {error ? <Alert tone="warning" title="Feedback à compléter">{error}</Alert> : null}
      <Select
        label="Note"
        name="rating"
        defaultValue="5"
        required
        options={[
          { label: '5 - Très utile', value: '5' },
          { label: '4 - Utile', value: '4' },
          { label: '3 - Moyen', value: '3' },
          { label: '2 - Peu utile', value: '2' },
          { label: '1 - Inadapté', value: '1' }
        ]}
      />
      <Textarea
        label="Commentaire"
        name="comment"
        placeholder="Ce qui était pertinent ou à améliorer"
        rows={4}
        required
        hint="Le commentaire aide à expliquer la note dans une logique d’amélioration continue."
        error={error ? 'Commentaire attendu.' : undefined}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Envoi...' : 'Envoyer le feedback'}
      </Button>
      {isSent ? <Alert tone="success" title="Feedback enregistré">Merci, le feedback a été envoyé avec le profil {userId}.</Alert> : null}
    </form>
  );
}
