# Benchmark frontend - HealthAI Coach

## Contexte

Le frontend du projet se trouve dans `apps/web`. Il utilise React 18, TypeScript, Vite, React Router, TanStack Query, Recharts, Lucide React et un fichier CSS global responsive. Le but n'est pas de remplacer cette stack, mais de justifier pourquoi elle est adaptée au périmètre membre 3 : interface, UX, accessibilité, intégration API et démonstration jury.

## Frameworks comparés

| Solution | Points forts | Limites | Avis pour HealthAI Coach |
| --- | --- | --- | --- |
| React | Très utilisé, bon écosystème, composants réutilisables, compatible TanStack Query et Recharts | Demande de la rigueur sur l'état, les effets et l'accessibilité | Choix adapté : le projet est déjà en React et la stack couvre les besoins de démo |
| Vue | Prise en main rapide, templates lisibles, bonne structure pour formulaires | Moins cohérent avec le code existant, migration coûteuse | Non retenu car il faudrait réécrire l'app sans bénéfice suffisant |
| Angular | Framework complet, conventions fortes, formulaires avancés | Plus lourd, plus verbeux, surdimensionné pour une démo IA courte | Non retenu car le besoin est une interface légère et rapide à faire évoluer |

## Librairies de graphiques

| Solution | Points forts | Limites | Avis pour HealthAI Coach |
| --- | --- | --- | --- |
| Recharts | Déjà installé, simple avec React, composants lisibles, suffisant pour KPI, barres, secteurs | Bundle assez lourd si chargé partout | Conservé, avec lazy-loading des pages pour limiter le coût initial |
| Chart.js | Très connu, performant pour des graphiques simples | Intégration React moins naturelle selon les wrappers | Alternative possible, mais migration inutile |
| D3 | Très puissant et personnalisable | Complexe, plus long à maintenir | Trop avancé pour les besoins actuels |

## Pourquoi conserver la stack actuelle

- React + TypeScript sécurise les composants, les props et les contrats API.
- Vite apporte un lancement rapide et un build simple pour la soutenance.
- React Router correspond aux routes existantes : dashboard, nutrition, sport, analyse repas, historique, détail, profil.
- TanStack Query est pertinent pour les appels API, les états loading et le cache.
- Recharts suffit pour visualiser scores, répartition nutritionnelle et volume de recommandations.
- Les mocks dans `src/api` permettent une démo stable tant que le backend IA n'est pas entièrement branché.

## Limites

- Recharts augmente le bundle : le lazy-loading des pages limite l'impact, mais la librairie reste à surveiller.
- Le CSS global est simple et efficace, mais un design system plus structuré serait utile sur une version longue.
- Les mocks ne remplacent pas les vrais tests d'intégration avec NestJS/FastAPI/MongoDB.
