# Maquettes responsive - HealthAI Coach

## Écrans existants

Les écrans réellement présents dans `apps/web/src/features` sont :

- Connexion démo : accès avec `demo@healthai.local / Demo123!`.
- Dashboard IA : KPI, score moyen, état API/mock, graphiques Recharts, dernières recommandations.
- Analyse repas : URL ou fichier local, aperçu image, état loading, aliments détectés, macros et pistes.
- Recommandation nutrition : formulaire objectif/calories/budget/allergies/régime/préférences, résultat et contraintes.
- Recommandation sport : formulaire objectif/niveau/durée/matériel/préférences/limitations/fatigue, programme et exercices.
- Historique : liste filtrable par type de recommandation.
- Détail recommandation : entrée utilisateur, sortie IA, explication, modèle, signaux, feedback.
- Profil : synthèse utilisateur et préférences sauvegardées localement en mode démo.

## Adaptation desktop

Sur desktop, l'application utilise un layout en deux zones : sidebar fixe à gauche et contenu principal centré. Les cartes sont organisées en grilles de deux colonnes quand l'information peut être comparée, par exemple graphiques, détails ou résultats.

Les formulaires nutrition et sport utilisent deux colonnes pour réduire la longueur visuelle, avec un bouton d'action pleine largeur en bas. Les états loading, erreur et vide sont affichés dans des blocs visibles.

## Adaptation tablette

Sous environ 1040 px, la sidebar devient un menu latéral ouvrable par bouton. La topbar garde le titre, le badge démo et l'utilisateur. Les KPI passent progressivement en deux colonnes.

## Adaptation mobile

Sous environ 760 px :

- les grilles passent en une colonne ;
- les cartes gardent des espacements courts ;
- les lignes d'historique et d'exercice se transforment en blocs empilés ;
- les champs prennent toute la largeur ;
- le menu est accessible par bouton avec un scrim de fermeture.

## Choix UX

- Les formulaires affichent des aides courtes pour expliquer pourquoi les données sont demandées.
- Les scores sont accompagnés d'une phrase d'explication, pas seulement d'un pourcentage.
- Les badges indiquent le sens des statuts : `OK`, `à vérifier`, `à surveiller`, intensité faible/modérée/élevée.
- Un bandeau global indique que les données viennent des mocks frontend en mode démo.

## Captures à faire pour le rapport

- Dashboard desktop avec KPI et graphiques.
- Formulaire nutrition avant génération.
- Résultat nutrition avec score, contraintes et graphique macros.
- Formulaire sport mobile.
- Résultat sport avec précaution et liste d'exercices.
- Analyse repas avec aperçu image et aliments détectés.
- Historique avec filtre sport.
- Détail recommandation avec feedback.
- Profil après sauvegarde locale.
