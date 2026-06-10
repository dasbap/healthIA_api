# Rapport de tests frontend

## Stack de test

Le projet utilise Vitest, Testing Library, User Event, JSDOM et Jest DOM. Les tests se trouvent dans `apps/web/src/tests`.

## Tests existants conservés

- `NutritionRecommendPage.test.tsx` : affichage du formulaire et génération d'une recommandation nutrition.
- `SportRecommendPage.test.tsx` : affichage du formulaire et génération d'un programme sportif.
- `MealAnalysisPage.test.tsx` : formulaire, loading et résultat d'analyse repas.
- `RecommendationHistoryPage.test.tsx` : historique et filtre sport.

## Tests ajoutés

- Validation nutrition si les calories sont hors limites.
- Validation sport si la durée est hors limites.
- `FeedbackForm.test.tsx` : commentaire obligatoire avant envoi.
- `ProfilePage.test.tsx` : affichage du profil et confirmation de sauvegarde locale.
- `RecommendationDetailPage.test.tsx` : message clair si une recommandation est introuvable.

## Commandes

```bash
cd apps/web
npm ci
npm run test
npm run build
```

## Résultats observés

Dernière exécution :

- 7 fichiers de tests passés ;
- 9 tests passés ;
- build Vite réussi ;
- lazy-loading des pages actif ;
- plus d'avertissement Vite sur le chunk principal.

## Limites

- Les tests restent centrés sur les parcours critiques, pas sur toute l'interface.
- Pas encore de test end-to-end navigateur type Playwright.
- Pas de test automatique d'accessibilité avec axe.
- `npm audit` signale 7 vulnérabilités sur l'ensemble prod + dev, dont 1 critique. En production uniquement (`npm audit --omit=dev`), il reste 2 vulnérabilités modérées liées à React Router. Aucune correction automatique forcée n'a été appliquée pour éviter une rupture avant soutenance.
