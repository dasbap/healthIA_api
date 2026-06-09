# Parcours utilisateur frontend

## Profil utilisateur

Objectif : renseigner les informations qui personnalisent les recommandations.

Étapes : ouvrir `/profile`, lire la synthèse, modifier les préférences, enregistrer.

Données saisies : âge, taille, poids, objectif, budget, allergies, restrictions, matériel, limitations, préférences sportives.

Résultat attendu : confirmation "Profil mis à jour" et sauvegarde simulée dans le navigateur.

Erreurs possibles : sauvegarde API indisponible, données irréalistes si le backend ajoute des validations plus strictes.

## Recommandation nutrition

Objectif : générer un plan nutritionnel adapté à un objectif et à des contraintes.

Étapes : ouvrir `/nutrition/recommend`, compléter objectif, calories, budget, régime, allergies et préférences, générer.

Données saisies : objectif, calories cibles, budget hebdomadaire, allergies, régime alimentaire, préférences.

Résultat attendu : repas recommandé, score de compatibilité, contraintes respectées, graphique macros, conseils.

Erreurs possibles : calories hors limites, budget trop bas, API indisponible. En mode démo, un mock prend le relais.

## Recommandation sport

Objectif : proposer une séance adaptée au niveau et aux limitations.

Étapes : ouvrir `/sport/recommend`, compléter objectif, niveau, durée, matériel, fatigue, préférences, limitations, générer.

Données saisies : objectif, niveau, durée, matériel, préférences, limitations physiques, fatigue.

Résultat attendu : programme, score, durée, intensité, précaution si limitation, liste d'exercices et graphique.

Erreurs possibles : durée hors limites, fatigue ou niveau manquant, API indisponible.

## Analyse repas

Objectif : simuler une analyse photo/URL d'un repas.

Étapes : ouvrir `/meal-analysis`, fournir une URL ou un fichier local, lancer l'analyse.

Données saisies : URL d'image ou fichier local.

Résultat attendu : aperçu, loading, aliments détectés, estimation nutritionnelle, déséquilibres et suggestions.

Erreurs possibles : source manquante, image inaccessible, futur endpoint non disponible.

## Historique

Objectif : consulter les recommandations déjà générées.

Étapes : ouvrir `/recommendations`, filtrer par type si besoin, ouvrir un détail.

Données saisies : filtre `Tous`, `Nutrition`, `Sport`, `Analyse repas`.

Résultat attendu : liste filtrée avec score, date, statut et lien détail.

Erreurs possibles : aucun résultat pour le filtre, endpoint historique indisponible.

## Détail recommandation

Objectif : comprendre une recommandation.

Étapes : ouvrir `/recommendations/:id`, lire l'entrée utilisateur, la sortie IA, l'explication, le modèle et les signaux.

Données affichées : résumé, score, input utilisateur, résultat IA, explication, modèle, version, date, signaux.

Résultat attendu : traçabilité claire et feedback possible.

Erreurs possibles : identifiant introuvable ; un message clair est affiché.

## Feedback

Objectif : simuler un retour utilisateur pour améliorer les recommandations.

Étapes : choisir une note, écrire un commentaire, envoyer.

Données saisies : note de 1 à 5, commentaire.

Résultat attendu : confirmation locale de feedback enregistré.

Erreurs possibles : commentaire vide ou trop court, endpoint feedback indisponible.
