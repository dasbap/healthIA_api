import { FormEvent, type ChangeEvent, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

type MealUploadFormProps = {
  onSubmit: (payload: { imageUrl?: string; fileName?: string; previewUrl?: string }) => void;
  isLoading: boolean;
};

export function MealUploadForm({ onSubmit, isLoading }: MealUploadFormProps) {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ imageUrl, fileName, previewUrl });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Source du repas</h2>
          <p>URL d’image ou fichier local pour simuler l’analyse vision.</p>
        </div>
      </CardHeader>
      <form className="form-grid" onSubmit={handleSubmit}>
        <Input label="URL d’image" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
        <label className="file-drop" htmlFor="meal-file">
          <UploadCloud aria-hidden="true" />
          <span>{fileName || 'Choisir une photo de repas'}</span>
          <input id="meal-file" type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {previewUrl || imageUrl ? (
          <img className="meal-preview" src={previewUrl || imageUrl} alt="Apercu du repas a analyser" />
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyse en cours...' : 'Analyser le repas'}
        </Button>
      </form>
    </Card>
  );
}
