import { afterEach, describe, expect, it, vi } from 'vitest';

describe('recommendationsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('appelle l’historique avec le userId fourni', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const { getRecommendationHistory } = await import('../api/recommendationsApi');

    await getRecommendationHistory('history-user');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/recommendations/history-user',
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
  });

  it('appelle le detail avec le recommendationId fourni', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'rec_detail',
          type: 'nutrition',
          title: 'Detail API',
          score: 0.8,
          status: 'completed',
          createdAt: new Date().toISOString(),
          summary: 'Resume',
          userInput: 'Input',
          aiResult: 'Resultat',
          explanation: 'Explication',
          model: 'healthai-nutrition-fallback-v1',
          modelVersion: '1.0.0-fallback',
          signals: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const { getRecommendationDetail } = await import('../api/recommendationsApi');

    await getRecommendationDetail('rec_detail');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/recommendations/detail/rec_detail',
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
  });

  it('envoie le feedback avec userId, note et commentaire', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'http://localhost:8000');
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    const { sendFeedback } = await import('../api/recommendationsApi');

    await sendFeedback('rec_feedback', 'feedback-user', 4, 'Utile.');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/ai/recommendations/rec_feedback/feedback',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: 'feedback-user', rating: 4, comment: 'Utile.' })
      })
    );
  });
});
