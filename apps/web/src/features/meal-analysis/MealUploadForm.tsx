import { FormEvent, type ChangeEvent, type DragEvent, useEffect, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
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
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function selectFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Déposez une image au format PNG, JPG ou WebP.');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    selectFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    selectFile(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl.trim() && !fileName) {
      setError('Ajoutez une URL d’image ou sélectionnez un fichier repas.');
      return;
    }
    setError('');
    onSubmit({ imageUrl, fileName, previewUrl });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2>Source du repas</h2>
          <p>URL d’image ou fichier local pour simuler l’analyse vision. Aucun fichier n’est envoyé au serveur en mode démo.</p>
        </div>
      </CardHeader>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        {error ? <Alert tone="warning" title="Source manquante">{error}</Alert> : null}
        <Input
          label="URL d’image"
          type="url"
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            setError('');
          }}
          hint="Exemple accepté : URL publique d’une photo de repas."
        />
        <label
          className={`file-drop ${isDragging ? 'file-drop-active' : ''}`}
          htmlFor="meal-file"
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud aria-hidden="true" />
          <span>{fileName || 'Glisser-déposer une photo ici, ou choisir une photo de repas'}</span>
          <input id="meal-file" type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {previewUrl || imageUrl ? (
          <img className="meal-preview" src={previewUrl || imageUrl} alt={fileName ? `Aperçu du repas ${fileName}` : 'Aperçu du repas à analyser'} />
        ) : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyse en cours...' : 'Analyser le repas'}
        </Button>
      </form>
    </Card>
  );
}
