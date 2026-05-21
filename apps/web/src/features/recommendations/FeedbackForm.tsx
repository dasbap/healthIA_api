import { FormEvent, useState } from 'react';
import { sendFeedback } from '../../api/recommendationsApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export function FeedbackForm({ recommendationId }: { recommendationId: string }) {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsLoading(true);
    await sendFeedback(recommendationId, Number(form.get('rating')), String(form.get('comment')));
    setIsSent(true);
    setIsLoading(false);
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Select
        label="Note"
        name="rating"
        defaultValue="5"
        options={[
          { label: '5 - Tres utile', value: '5' },
          { label: '4 - Utile', value: '4' },
          { label: '3 - Moyen', value: '3' },
          { label: '2 - Peu utile', value: '2' },
          { label: '1 - Inadapte', value: '1' }
        ]}
      />
      <Input label="Commentaire" name="comment" placeholder="Ce qui etait pertinent ou a ameliorer" />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Envoi...' : 'Envoyer le feedback'}
      </Button>
      {isSent ? <Alert tone="success" title="Feedback enregistre">Merci, la confirmation reste locale en mode demo.</Alert> : null}
    </form>
  );
}
