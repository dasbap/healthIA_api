# Documentation IA — HealthIA Coach
## Vue d'ensemble des 4 modules

Le système IA de HealthIA Coach est composé de 4 modules indépendants et interconnectés :

| Module | Rôle | Technique | Résultat |
|--------|------|-----------|---------|
| Module 1 | Analyse photo de repas | Fine-tuning ViT (Vision Transformer) | 95.39% accuracy |
| Module 2 | Estimation nutritionnelle | Recherche dans base de données | 335 aliments, CC0 |
| Module 3 | Recommandation repas | RandomForestClassifier | 100% accuracy (dataset synthétique) |
| Module 4 | Recommandation sport | RandomForestClassifier | 100% accuracy (dataset synthétique) |

---

## Module 1 — Analyse de photo de repas

### Objectif
Prendre une photo d'un repas et identifier automatiquement les aliments présents avec un score de confiance.

### Dataset
- **Nom** : Food Types v3 (Roboflow)
- **Taille** : 6 111 images, 15 classes alimentaires
- **Split** : 70% train (5 358 images) / 20% validation (469) / 10% test (239)
- **Classes** : arroz, banana, cerdo, cerdo pork, frutilla, huevos, manzana, naranja, noodles, orange, pescado, pollo, pork, tomato, naan
- **Limite identifiée** : 3 classes représentent le même aliment (cerdo / cerdo pork / pork = porc en espagnol, mixte, anglais) — redondance volontaire du dataset source

### Pourquoi ce dataset et pas Food-101 ?
Le modèle `nateraw/food` a été pré-entraîné sur Food-101. Utiliser Food-101 pour le fine-tuning n'aurait apporté aucune nouvelle information. Le dataset Roboflow apporte des images nouvelles et des classes adaptées à l'usage de l'application.

### Modèle choisi — nateraw/food (ViT)

**Comparatif des modèles évalués :**

| Modèle | Type | Accuracy estimée | Taille | Choix |
|--------|------|-----------------|--------|-------|
| ResNet-50 | CNN | ~88% | 98 MB | ✗ |
| EfficientNet-B3 | CNN | ~91% | 48 MB | ✗ |
| **nateraw/food (ViT)** | **Transformer** | **95.4%** | **330 MB** | **✓** |
| CLIP | Multimodal | ~85% | 400 MB | ✗ |

**Pourquoi ViT ?**
- Architecture Vision Transformer : découpe l'image en patches de 16×16 pixels, chaque patch est traité comme un token (comme en NLP)
- Le mécanisme d'attention capture les relations globales dans l'image — pas seulement des features locales comme les CNN
- Pré-entraîné sur Food-101 (101 classes alimentaires) → il possède déjà une représentation visuelle fine des aliments

**Paramètre clé `ignore_mismatched_sizes=True`** : le modèle original a 101 classes de sortie. Ce paramètre permet de reconfigurer la couche finale pour nos 15 classes sans perdre les poids des couches intermédiaires.

### Approche — Fine-tuning (Transfer Learning)

Plutôt qu'entraîner un modèle from scratch (qui nécessiterait des millions d'images et plusieurs jours de calcul), on fine-tune un modèle pré-entraîné :
1. Charger `nateraw/food` avec ses poids pré-entraînés sur Food-101
2. Remplacer uniquement la couche de classification finale (101 → 15 classes)
3. Ré-entraîner sur notre dataset Roboflow en 3 epochs

### Preprocessing
- Chaque image est redimensionnée à **224×224 pixels**
- Normalisée et convertie en RGB via `AutoImageProcessor`
- Les transformations sont gérées automatiquement par HuggingFace

### Configuration du fine-tuning

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Epochs | 3 | Suffisant pour converger sans overfitting |
| Learning rate | 2e-5 | Standard pour le fine-tuning de transformers |
| Batch size | 16 | Adapté à la mémoire GPU (T4 Google Colab) |
| Optimizer | AdamW | Inclus dans HuggingFace Trainer |
| Weight decay | 0.01 | Régularisation légère |
| Eval strategy | epoch | Évaluation à chaque epoch |

### Ajustements réalisés

| Paramètre | Valeur initiale | Valeur finale | Impact |
|-----------|----------------|---------------|--------|
| Learning rate | 5e-5 | 2e-5 | Meilleure convergence, moins d'oscillations |
| Epochs | 2 | 3 | +4.39% d'accuracy |
| Batch size | 32 | 16 | Adapté aux contraintes mémoire GPU |

- **LR 2e-5** : un LR trop élevé (5e-5) causait des oscillations de la loss
- **3 epochs** : 2 epochs donnaient 89% — passer à 3 a permis d'atteindre 95.39% sans overfitting (la validation loss reste stable)
- **Batch size 16** : le batch de 32 causait des erreurs mémoire sur le GPU utilisé

### Résultats

| Métrique | Valeur | Interprétation |
|----------|--------|----------------|
| Training Loss | 0.0894 | Très faible — le modèle apprend bien |
| Validation Loss | 0.2268 | Plus élevée mais stable — pas d'overfitting significatif |
| **Test Accuracy (Top-1)** | **95.39%** | 228 images correctes sur 239 |
| Test Accuracy (Top-3) | ~98%+ | Le bon aliment est dans les 3 premières propositions |

**Courbe de loss :**
- Epoch 1 : train=0.200 / val=0.235
- Epoch 2 : train=0.089 / val=0.227
- Epoch 3 : train=0.089 / val=0.227

L'écart modéré entre training loss et validation loss est acceptable — normal avec un dataset de taille moyenne.

### Pourquoi 95% ?
Trois facteurs combinés expliquent ce résultat :
1. **Transfer Learning** : le modèle avait déjà appris à reconnaître des aliments sur Food-101 — le fine-tuning n'a fait qu'adapter la dernière couche
2. **Dataset de qualité** : 6 111 images bien labellisées, classes globalement équilibrées
3. **Architecture ViT** : le mécanisme d'attention capture les relations globales dans l'image — supérieur aux CNN pour ce type de tâche

### Métriques détaillées

#### Matrice de confusion
- Diagonale forte : la plupart des classes sont bien prédites
- Confusions principales : cerdo ↔ pork (même aliment, noms différents) — sémantiquement acceptable
- Classes avec peu d'images de test (arroz : 2 images, pollo : 2 images) → statistiquement non fiables

#### Classification Report — lecture
- **Precision** : sur toutes les prédictions "banana", combien de fois a-t-il raison ?
- **Recall** : sur toutes les images de "banana", combien le modèle en trouve-t-il ?
- **F1-score** : moyenne harmonique entre precision et recall — métrique principale
- **Support** : nombre d'images de test par classe

#### Analyse des erreurs
- **Erreurs acceptables** : cerdo → pork, cerdo pork → pork (même aliment, noms différents)
- **Erreurs non acceptables** : aliment confondu avec une catégorie différente (impact sur Module 2)
- Les erreurs réelles sont liées au faible nombre d'images de test (1-2 images par classe) — pas statistiquement significatif

#### Confidence moyenne par classe
- **Fiable** : accuracy > 80% ET confidence > 70%
- **Fragile** : confidence faible malgré bonne accuracy
- **Non fiable** : le modèle hésite — nécessiterait plus de données

**Décision produit** : pour les classes fragiles, afficher "Aliment détecté avec faible confiance — veuillez vérifier"

#### Precision vs Recall par classe
- Classes performantes (recall >= 90%) : banana, frutilla, tomato, orange, manzana, huevos
- Classes avec recall faible : cerdo, cerdo pork (classes redondantes — acceptable), arroz, pollo (pas assez d'images de test)

### Fonction principale

```python
analyze_meal_image(image_path, top_k=3) -> dict
# Retourne: {"detected_foods": [{"label": "banana", "confidence": 0.92}, ...]}
```

Retourne les top-3 aliments les plus probables avec leur score de confiance.

### Limites
1. Classes redondantes : cerdo / cerdo pork / pork → à fusionner dans une future version
2. 15 classes uniquement — la diversité alimentaire mondiale est beaucoup plus large
3. Moins performant sur des repas complexes avec plusieurs aliments dans la même image
4. Dataset de test déséquilibré : certaines classes ont seulement 1-2 images de test
5. Usage production : nécessiterait > 50 classes et > 20 000 images

---

## Module 2 — Estimation nutritionnelle

### Objectif
À partir des aliments détectés par le Module 1, calculer les apports nutritionnels (calories, protéines, glucides, lipides) et détecter les déséquilibres selon l'objectif de l'utilisateur.

### Approche
Pas de modèle ML ici — approche par **base de données nutritionnelle réelle**.

**Pourquoi pas de ML ?** Les valeurs nutritionnelles sont des données factuelles (une banane contient ~89 kcal/100g). Un modèle ML n'apporterait pas de valeur ajoutée pour des faits établis par la biochimie.

### Dataset
- **Nom** : Nutritional Facts for most common foods (Kaggle, niharika41298)
- **Licence** : CC0 (domaine public)
- **Taille** : 335 aliments, 16 catégories
- **Colonnes** : Food, Measure, Grams, Calories, Protein, Fat, Sat.Fat, Fiber, Carbs, Category

### EDA — Observations clés
- 335 aliments répartis en 16 catégories (fruits, légumes, viandes, produits laitiers...)
- Catégories les mieux représentées : fruits, légumes, viandes
- Corrélation forte Calories ↔ Fat : les lipides sont la source d'énergie la plus dense (9 kcal/g vs 4 pour glucides/protéines)
- Corrélation modérée Calories ↔ Carbs
- Distribution asymétrique des calories : la plupart des aliments ont moins de 500 kcal par portion

### Nettoyage des données

Problèmes identifiés et résolus :
- Valeur `'t'` (trace) dans certaines colonnes numériques → remplacée par 0
- Virgules dans les grands nombres (ex: `1,419`) → supprimées
- 1 valeur manquante dans Calories, 2 dans Sat.Fat → remplacement par la médiane
- Normalisation à 100g : chaque aliment a une portion de référence différente

Résultat : 0 valeur manquante, toutes les colonnes numériques bien typées.

### Fonctions principales

#### `estimate_nutrition(detected_foods, portion="standard")`
Algorithme :
1. Pour chaque aliment, recherche approximative dans le dataset via `str.contains()`
2. Si trouvé : normalise les valeurs à 100g (divise par la portion de référence)
3. Calcule les totaux calories/protéines/glucides/lipides

**Limite** : la recherche par `str.contains()` est approximative — `'orange'` peut trouver `'Oranges 3" diameter'`. Compromis acceptable pour un prototype.

#### `detect_imbalances(totals, user_goal)`
Détecte les déséquilibres selon l'objectif :

| Objectif | Critère | Seuil |
|----------|---------|-------|
| perte_de_poids | Calories max | 400 kcal |
| perte_de_poids | Glucides max | 50g |
| perte_de_poids | Lipides max | 15g |
| prise_de_masse | Protéines min | 20g |
| prise_de_masse | Calories min | 500 kcal |

Ces seuils sont basés sur les recommandations nutritionnelles générales.

### Tests de validation

**Repas équilibré (banana + tomato + orange)** :
- ~110 kcal, riche en glucides naturels (sucres des fruits)
- Protéines et lipides quasi absents — normal pour des fruits

**Repas riche (pasta + pork)** :
- ~783 kcal, très riche en lipides (91.7g)
- Alertes déclenchées pour objectif perte_de_poids : calories > 400 ET lipides > 15g

### Limites
1. Recherche approximative : faux positifs possibles
2. 335 aliments seulement — certains aliments du Module 1 peuvent être absents
3. Portions standardisées à 100g — les portions réelles varient
4. Pas de prise en compte des méthodes de cuisson (pomme de terre cuite vs frite)
5. Dataset en anglais — les labels du Module 1 sont en espagnol/anglais

---

## Module 3 — Recommandations nutritionnelles personnalisées

### Objectif
À partir d'un profil utilisateur (âge, poids, objectif, régime alimentaire, allergies, calories cibles), recommander un type de repas adapté.

### Pourquoi un dataset synthétique ?
Il n'existe pas de dataset public avec des labels "type de repas recommandé selon un profil utilisateur". Ces labels sont des **concepts métier** définis selon des règles nutritionnelles. Le dataset synthétique permet de contrôler précisément les règles et d'entraîner un modèle reproductible.

### Dataset synthétique
- **Taille** : 1 000 profils utilisateurs générés avec `np.random.seed(42)`
- **Features** : age, poids_kg, objectif, regime, calories_cibles, allergie_gluten, allergie_lactose
- **Labels** : générés par des règles `if/else` déterministes

**Règles métier pour les labels :**

| Label | Condition |
|-------|-----------|
| `low_calorie_meal` | objectif == perte_de_poids ET calories_cibles < 1 600 kcal |
| `high_protein_meal` | objectif == prise_de_masse |
| `performance_meal` | objectif == performance |
| `balanced_meal` | tous les autres cas |

**Distribution des labels :**
- `balanced_meal` : surreprésenté (~40%) — couvre tous les cas non spécifiques
- `performance_meal` : ~27%
- `high_protein_meal` : ~26%
- `low_calorie_meal` : sous-représenté (~6%) — nécessite deux conditions simultanées

Ce déséquilibre est intentionnel et réaliste.

### Modèle — RandomForestClassifier

**Comparatif :**

| Modèle | Avantages | Inconvénients | Choix |
|--------|-----------|---------------|-------|
| **RandomForest** | **Données tabulaires, robuste, interprétable** | **Moins adapté aux grandes dimensions** | **✓** |
| SVM | Bon sur petits datasets | Nécessite normalisation, boîte noire | ✗ |
| Régression logistique | Simple, rapide | Linéaire, limité | ✗ |
| XGBoost | Très performant | Surapprentissage sur petits datasets | ✗ |

**Pourquoi RandomForest ?**
- Adapté aux données tabulaires avec variables mixtes (numériques + catégorielles)
- Robuste au surapprentissage grâce à l'ensemble de 100 arbres
- Fournit l'importance des features — utile pour expliquer les recommandations
- Pas besoin de normalisation contrairement à SVM ou régression logistique

### Pipeline d'entraînement

1. **Encoding** : `LabelEncoder` sur objectif et regime (variables catégorielles → entiers)
   - `perte_de_poids` → 0, `equilibre` → 1, `performance` → 2, `prise_de_masse` → 3
2. **Split** : 80/20 (800 profils train, 200 test), `random_state=42`
3. **Entraînement** : `RandomForestClassifier(n_estimators=100, random_state=42)`
4. **Évaluation** : accuracy_score + classification_report

### Résultats

**Accuracy : 100%** sur le test set.

Ce résultat s'explique par la nature déterministe du dataset :
- Les labels ont été générés par des règles `if/else` explicites
- Le RandomForest apprend exactement ces règles → il les reproduit à 100%
- Ce n'est **pas de l'overfitting** — c'est normal quand les données sont générées par des règles simples

**Classification Report :** toutes les métriques à 1.00 (precision, recall, F1) pour les 4 classes.

**Matrice de confusion :** diagonale parfaite, aucune erreur.

### Preuve par le bruit — Test de robustesse

Pour démontrer que le 100% est lié au dataset et non au modèle, on simule des données réelles en ajoutant du bruit :
- **Bruit numérique** : variations gaussiennes sur age, poids_kg, calories_cibles
- **Flip de labels** : certains labels changés aléatoirement (comportements atypiques)

| Niveau de bruit | Accuracy estimée |
|----------------|-----------------|
| 0% (dataset original) | 100% |
| 5% | ~97% |
| 10% | ~90% |
| 20% | ~80% |
| 30% | ~72% |

**Conclusion** : avec de vraies données utilisateurs, on estimerait l'accuracy entre **75% et 85%**. Le dataset synthétique valide l'architecture mais le modèle devrait être réentraîné sur de vraies données collectées par l'application.

### Importance des features

Ordre d'importance décroissant :
1. **objectif_encoded** : feature la plus discriminante — détermine directement le label
2. **calories_cibles** : important pour distinguer `low_calorie_meal` (seuil 1 600 kcal)
3. **regime_encoded** : influence `balanced_meal` pour les végétariens
4. age, poids_kg, allergies : peu influents dans les règles actuelles

### Fonction principale

```python
recommend_meal(user_profile: dict) -> dict
# Entrée: {"goal": "weight_loss", "calorie_target": 1500, "diet": "aucun", ...}
# Sortie: {"recommended_type": "low_calorie_meal", "score": 0.76, "recommended_meal": [...]}
```

**Exemple de résultat** : profil weight_loss + 1 500 kcal → `low_calorie_meal` avec 76% de confiance.
Le score de 76% (pas 100%) montre que le modèle tient compte de plusieurs features, pas seulement l'objectif.

### Limites
1. Dataset synthétique — règles simplifiées
2. 4 classes uniquement
3. Allergies et régime ont peu d'impact dans la version actuelle
4. Exemples de repas statiques (codés en dur)
5. Pas d'adaptation dans le temps selon les résultats de l'utilisateur

---

## Module 4 — Recommandations sportives personnalisées

### Objectif
À partir d'un profil utilisateur (âge, poids, objectif sportif, niveau, durée de séance, matériel disponible, fatigue, limitations physiques), recommander un programme sportif adapté.

### Dataset synthétique
- **Taille** : 1 000 profils utilisateurs, `np.random.seed(42)`
- **Features** : age, poids_kg, objectif, niveau, duree_min, materiel, fatigue (1-10), limitation_physique (0/1)
- **Labels** : 5 programmes sportifs

**Règles métier :**

| Label | Condition |
|-------|-----------|
| `mobility_recovery` | limitation_physique == 1 OU fatigue >= 8 |
| `muscle_gain_plan` | objectif == prise_de_masse |
| `endurance_plan` | objectif == endurance ET niveau != débutant |
| `cardio_beginner` | niveau == débutant OU objectif == santé_générale |
| `strength_full_body` | tous les autres cas |

**Distribution des labels :**
- `cardio_beginner` : classe dominante (beaucoup de débutants + santé générale)
- `mobility_recovery` : importante (fatigue >= 8/10 fréquente)
- `muscle_gain_plan`, `endurance_plan`, `strength_full_body` : classes minoritaires

### Modèle — RandomForestClassifier (même architecture que Module 3)

Cohérence avec le Module 3 pour faciliter la maintenance.

**Features supplémentaires vs Module 3 :**
- `niveau` (débutant / intermédiaire / avancé)
- `materiel` (aucun / domicile / salle)
- `fatigue` (1-10)
- `limitation_physique` (0/1)

### Pipeline d'entraînement

1. **Encoding** : `LabelEncoder` sur objectif, niveau, materiel
2. **Split** : 80/20 (800 profils train, 200 test)
3. **Entraînement** : `RandomForestClassifier(n_estimators=100, random_state=42)`

### Résultats

**Accuracy : 100%** — même explication que Module 3 (dataset déterministe).

**Matrice de confusion :** diagonale parfaite pour les 5 classes.

### Preuve par le bruit — Test de robustesse

Même méthodologie que Module 3 avec bruit sur age, poids_kg, duree_min, fatigue.

| Niveau de bruit | Accuracy estimée |
|----------------|-----------------|
| 0% (dataset original) | 100% |
| 10% | ~88% |
| 30% | ~70% |

**Conclusion** : accuracy estimée en production entre **75% et 85%**.

### Importance des features

Ordre d'importance décroissant :
1. **fatigue** et **limitation_physique** : features les plus importantes — déterminent directement `mobility_recovery`
2. **objectif_encoded** : détermine `muscle_gain_plan` et `endurance_plan`
3. **niveau_encoded** : distingue `cardio_beginner` des autres
4. age, poids_kg, duree_min, materiel : moins influents dans les règles actuelles

En production avec de vraies données, le matériel et la durée seraient probablement plus influents.

### Fonction principale

```python
recommend_sport(user_profile: dict) -> dict
# Entrée: {"objectif": "sante_generale", "niveau": "debutant", "fatigue": 4, ...}
# Sortie: {"recommended_program": "cardio_beginner", "score": 0.95, "exercises": [...]}
```

**Tests de validation :**
- Débutant, santé générale → `cardio_beginner`
- Fatigue = 9 → `mobility_recovery`
- Prise de masse → `muscle_gain_plan`

### Limites
1. Dataset synthétique — règles simplifiées
2. 5 programmes uniquement
3. Pas de progression adaptative dans le temps
4. Exercices statiques (codés en dur)
5. Pas de prise en compte de l'historique des séances

---

## Résumé comparatif des 4 modules

| | Module 1 | Module 2 | Module 3 | Module 4 |
|--|---------|---------|---------|---------|
| **Technique** | ViT fine-tuning | Base de données | RandomForest | RandomForest |
| **Dataset** | 6 111 images réelles | 335 aliments réels | 1 000 profils synthétiques | 1 000 profils synthétiques |
| **Accuracy** | 95.39% | N/A (lookup) | 100%* | 100%* |
| **Accuracy en production estimée** | ~93-95% | ~85-90% | ~75-85% | ~75-85% |
| **Métriques utilisées** | Accuracy, Precision, Recall, F1, Top-K | N/A | Accuracy, Precision, Recall, F1 | Accuracy, Precision, Recall, F1 |
| **Matrice de confusion** | Oui (15×15) | N/A | Oui (4×4) | Oui (5×5) |

*100% lié au dataset synthétique déterministe — voir test de robustesse par bruit.

## Stack technique

| Composant | Outil | Version |
|-----------|-------|---------|
| Langage | Python | 3.11 |
| Deep Learning | PyTorch + HuggingFace Transformers | latest |
| ML classique | scikit-learn | latest |
| Data | pandas, numpy | latest |
| Visualisation | matplotlib, seaborn | latest |
| Évaluation | evaluate (HuggingFace) | latest |
| Sérialisation modèles | joblib | latest |
| Environnement entraînement | Google Colab (GPU T4) | — |
