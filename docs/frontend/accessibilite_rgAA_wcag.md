# Accessibilité RGAA / WCAG - Frontend

## Objectif

L'objectif est de rendre l'interface HealthAI Coach compréhensible, navigable au clavier et présentable devant un jury, sans prétendre à une certification RGAA complète.

## Règles prises en compte

- Structure sémantique : présence de `main`, `nav`, `aside`, `header`, `section`, vrais boutons et vrais liens.
- Hiérarchie de titres : un `h1` principal par page, puis des `h2`/`h3` dans les cartes.
- Champs de formulaire : labels associés, aides reliées avec `aria-describedby`, erreurs reliées aux champs invalides.
- Champs obligatoires : astérisque visuel et attributs `required` / `aria-required`.
- États dynamiques : loading avec `role="status"` et alertes d'erreur avec `role="alert"` si nécessaire.
- Navigation clavier : lien d'évitement vers le contenu principal, focus visible, menu mobile fermable.
- Couleur : les statuts ne reposent pas uniquement sur la couleur ; les badges ajoutent du texte comme `OK`, `à vérifier`, `à surveiller`.
- Images : l'aperçu du repas possède un texte alternatif.

## Améliorations réalisées

- Ajout d'un lien "Aller au contenu principal".
- Remplacement du `h1` global de la topbar par des `h1` propres à chaque page.
- Ajout d'un bandeau global indiquant clairement le mode démo/mock.
- Amélioration des composants `Input`, `Select` et ajout d'un `Textarea` accessible.
- Ajout de messages de validation visibles sur nutrition, sport, analyse repas et feedback.
- Ajout de textes explicatifs pour les scores de compatibilité.
- Amélioration des libellés de badges pour éviter une information uniquement colorée.
- Ajout d'un focus visible sur boutons, champs, liens et zone de dépôt fichier.

## Checklist simple RGAA/WCAG

| Point vérifié | Statut | Commentaire |
| --- | --- | --- |
| Titre principal par page | OK | Les pages fonctionnelles ont un `h1` |
| Labels de formulaire | OK | Champs `Input`, `Select`, `Textarea` labelisés |
| Messages d'erreur visibles | OK | Validation nutrition/sport/feedback/analyse repas |
| Focus visible | OK | Style CSS global `:focus-visible` |
| Navigation clavier | Partiel | Navigation possible, mais pas encore testée avec lecteur d'écran réel |
| Contrastes | OK visuel | Palette claire, à confirmer avec outil automatique |
| Images alternatives | OK | Aperçu repas avec `alt` descriptif |
| Information non uniquement couleur | OK | Badges textuels |
| Responsive mobile | OK | Grilles transformées en une colonne |

## Limites restantes

- Pas d'audit RGAA complet avec outil spécialisé.
- Les graphiques Recharts sont surtout accompagnés par des données textuelles ; un audit lecteur d'écran pourrait améliorer leur restitution.
- Le menu mobile n'a pas encore de focus trap, car ce n'est pas une modale complète.
- Les textes sont en français, mais il n'y a pas de gestion i18n.

## À dire à l'oral

"J'ai traité l'accessibilité comme une contrainte de conception, pas comme une correction finale. Chaque page a un vrai titre principal, les formulaires ont des labels, les erreurs sont visibles et reliées aux champs, le focus clavier est visible et les informations importantes ne dépendent pas uniquement de la couleur. L'application n'est pas certifiée RGAA, mais elle applique les bases WCAG utiles pour une démo professionnelle."
