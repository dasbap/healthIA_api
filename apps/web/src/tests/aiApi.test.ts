import { afterEach, describe, expect, it, vi } from 'vitest';

const mealUploadResponse = {
  analysisId: 'rec_meal_upload',
  detectedFoods: [{ label: 'repas mixte', confidence: 0.55 }],
  nutrition: { calories: 520, protein: 24, carbs: 62, fat: 18 },
  imbalances: ['Glucides eleves'],
  suggestions: ['Verifier les portions si l’estimation semble trop haute.'],
  explanation: 'Analyse estimee depuis fichier image recu.',
  model: 'healthai-vision-fallback-v1',
  createdAt: new Date().toISOString(),
  fallbackUsed: true
};

describe('analyzeMeal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('envoie un fichier image avec FormData sans forcer le Content-Type JSON', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mealUploadResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const { analyzeMeal } = await import('../api/aiApi');
    const file = new File([new Uint8Array([1, 2, 3])], 'assiette-sante.png', { type: 'image/png' });

    await analyzeMeal({ file, fileName: file.name });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/meal/analyze',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    );

    const [, requestInit] = fetchMock.mock.calls[0];
    const formData = requestInit?.body as FormData;
    const headers = requestInit?.headers as Headers;

    expect(formData.get('file')).toBe(file);
    expect(formData.get('fileName')).toBe('assiette-sante.png');
    expect(formData.get('userId')).toBe('profile_demo_001');
    expect(headers.get('Content-Type')).toBeNull();
  });
});
