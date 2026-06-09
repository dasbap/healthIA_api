# Soutenance frontend - Membre 3

## Ce que j'ai réalisé

J'ai travaillé sur la partie frontend de HealthAI Coach dans `apps/web`. L'application propose les parcours principaux : dashboard, analyse repas, recommandation nutrition, recommandation sport, historique, détail, feedback et profil.

J'ai amélioré l'UX des formulaires, les messages d'erreur, les états loading, les résultats IA et la clarté des mocks. J'ai aussi ajouté les documents frontend attendus pour expliquer mes choix.

## Choix UX/UI

L'interface reste claire et professionnelle, avec des cartes simples, des badges, des graphiques et des textes d'aide courts. Le but n'est pas d'avoir une interface gadget, mais une démo sérieuse et compréhensible.

Les scores sont expliqués, les contraintes sont visibles et les recommandations indiquent pourquoi elles sont proposées.

## Accessibilité

J'ai ajouté une meilleure hiérarchie de titres, un lien d'évitement, des labels associés aux champs, des erreurs visibles, un focus clavier visible et des libellés qui ne reposent pas uniquement sur la couleur.

Je peux dire que l'application applique les bases RGAA/WCAG, sans prétendre à une certification complète.

## Intégration API

Les appels API sont centralisés dans `src/api`. Les endpoints IA attendus sont alignés avec le sujet :

- `/health` ;
- `/ai/nutrition/recommend` ;
- `/ai/sport/recommend` ;
- `/ai/meal/analyze` ;
- `/ai/recommendations/{user_id}` ;
- `/ai/recommendations/detail/{recommendation_id}` ;
- `/ai/recommendations/{recommendation_id}/feedback`.

## Mocks

Les mocks sont conservés pour garantir une démo stable tant que le backend IA n'est pas prêt. Un bandeau global précise que les recommandations viennent des mocks frontend en mode démo. Le profil et le feedback sont simulés localement.

## Démonstration conseillée

1. Montrer le dashboard et le badge API `Mock`.
2. Générer une recommandation nutrition et expliquer le score.
3. Générer une recommandation sport avec une limitation physique et montrer la précaution.
4. Lancer une analyse repas et montrer les aliments détectés.
5. Filtrer l'historique puis ouvrir un détail.
6. Envoyer un feedback.
7. Modifier le profil et montrer la confirmation de sauvegarde locale.

## Limites restantes

- Pas encore de vraie authentification.
- Pas encore de persistance MongoDB côté frontend.
- Les recommandations IA sont simulées.
- Pas d'audit RGAA complet ni de tests end-to-end.
- Les vulnérabilités npm doivent être analysées avant mise en production.

## Points forts

- Parcours utilisateur complets pour une démo MSPR.
- Stack cohérente et non réinventée.
- API centralisée avec fallback mock.
- Accessibilité prise en compte dans les composants partagés.
- Tests critiques présents et passants.
- Documentation claire pour défendre les choix devant le jury.
