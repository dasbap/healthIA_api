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
    expect(formData.get('userId')).toBe('demo-user');
    expect(headers.get('Content-Type')).toBeNull();
  });

  it('appelle /ai/nutrition/recommend quand les mocks sont désactivés', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          recommendationId: 'rec_nutrition_test',
          type: 'nutrition',
          title: 'Repas API',
          score: 0.82,
          mealPlan: ['Poulet', 'Riz', 'Légumes'],
          macros: { calories: 560, protein: 42, carbs: 59, fat: 16 },
          constraintsChecked: { allergies: true, diet: true, budget: true },
          explanation: 'Réponse API nutrition.',
          advice: ['Adapter les portions.'],
          model: 'healthai-nutrition-recommender-v1',
          fallbackUsed: false
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const { generateNutritionRecommendation } = await import('../api/aiApi');

    await generateNutritionRecommendation({
      userId: 'demo-user',
      goal: 'perte de graisse',
      targetCalories: 560,
      budget: 65,
      allergies: 'Noisettes',
      diet: 'omnivore',
      preferences: 'poulet',
      activityLevel: 'moderee'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/nutrition/recommend',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"targetCalories":560')
      })
    );
  });

  it('appelle /ai/sport/recommend quand les mocks sont désactivés', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          recommendationId: 'rec_sport_test',
          type: 'sport',
          title: 'Programme API',
          score: 0.84,
          duration: 30,
          intensity: 'low',
          exercises: [{ name: 'Marche rapide', duration: 15, intensity: 'low', note: 'Rythme confortable' }],
          explanation: 'Réponse API sport.',
          warning: 'Limiter les impacts.',
          model: 'healthai-sport-recommender-v1',
          fallbackUsed: false
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const { generateSportRecommendation } = await import('../api/aiApi');

    await generateSportRecommendation({
      userId: 'demo-user',
      goal: 'perte de graisse',
      level: 'debutant',
      duration: 30,
      sessionsPerWeek: 3,
      equipment: 'tapis',
      preferences: 'marche',
      limitations: 'genou',
      fatigue: 'moderee'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/sport/recommend',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"sessionsPerWeek":3')
      })
    );
  });
});
